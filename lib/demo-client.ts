import { demoRecords } from './seed';
import type { CareRecord, Data } from './model';

const STORAGE_KEY = 'hearing.browser-demo.v1';

type DemoMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  patient_ids: string;
  supplier_id: string;
  active: number;
};

type DemoEvent = {
  id: string;
  record_id: string;
  actor: string;
  action: string;
  summary: string;
  created_at: string;
};

type DemoRequestBody = {
  archive?: boolean;
  id?: string;
  kind?: string;
  data?: Data;
  month?: string;
  name?: string;
  email?: string;
  role?: string;
  patientIds?: string[];
  supplierId?: string;
  active?: boolean;
};

type DemoResponse = DemoState | { id: string } | { created: number };

type DemoState = {
  runtime: 'browser-demo';
  workspace: { id: string; name: string; demo: number };
  workspaces: { id: string; name: string; demo: number }[];
  user: null;
  role: 'admin';
  records: CareRecord[];
  members: DemoMember[];
  events: DemoEvent[];
  integrations: {
    payments: false;
    webhooks: false;
    supplier: 'manual';
    notifications: 'in-app';
    calendar: 'ics';
    storage: 'browser-demo';
  };
};

function initialState(): DemoState {
  const now = new Date().toISOString();
  return {
    runtime: 'browser-demo',
    workspace: { id: 'demo-browser', name: 'Northside Hearing', demo: 1 },
    workspaces: [{ id: 'demo-browser', name: 'Northside Hearing', demo: 1 }],
    user: null,
    role: 'admin',
    records: demoRecords().map((record) => ({
      ...record,
      revision: 1,
      created_at: now,
      updated_at: now,
      patient_id: String(record.data.patientId || ''),
      supplier_id: String(record.data.supplierId || ''),
    })),
    members: [],
    events: [],
    integrations: {
      payments: false,
      webhooks: false,
      supplier: 'manual',
      notifications: 'in-app',
      calendar: 'ics',
      storage: 'browser-demo',
    },
  };
}

export function loadBrowserDemo(): DemoState {
  if (typeof window === 'undefined') return initialState();
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as DemoState;
      if (parsed.runtime === 'browser-demo' && Array.isArray(parsed.records)) {
        return parsed;
      }
    }
  } catch {
    // A fresh fictional workspace is safer than failing the whole application.
  }
  const state = initialState();
  saveBrowserDemo(state);
  return state;
}

function saveBrowserDemo(state: DemoState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function audit(state: DemoState, recordId: string, action: string, summary: string) {
  state.events.unshift({
    id: crypto.randomUUID(),
    record_id: recordId,
    actor: 'Demo visitor',
    action,
    summary,
    created_at: new Date().toISOString(),
  });
  state.events = state.events.slice(0, 100);
}

function bodyJson(options?: RequestInit): DemoRequestBody {
  if (typeof options?.body !== 'string') return {};
  return JSON.parse(options.body) as DemoRequestBody;
}

function fileDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The demonstration file could not be read.'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export async function browserDemoRequest(path: string, options?: RequestInit): Promise<DemoResponse> {
  const state = loadBrowserDemo();
  const route = path.split('?')[0];
  if (route === 'state') return state;

  if (route === 'records') {
    const body = bodyJson(options);
    if (body.archive) {
      const id = String(body.id || 'unknown-record');
      const record = state.records.find((item) => item.id === id);
      state.records = state.records.filter((item) => item.id !== id);
      audit(state, id, 'archived', `${record?.kind || body.kind}: ${record?.data?.name || id}`);
      saveBrowserDemo(state);
      return { id };
    }

    const now = new Date().toISOString();
    const existing = state.records.find((item) => item.id === body.id);
    const id = existing?.id || `local-${crypto.randomUUID()}`;
    const data: Data = { ...(body.data || {}) };

    if (body.kind === 'orders') {
      const product = state.records.find((item) => item.id === data.productId && item.kind === 'products');
      if (product) {
        data.unitPrice = existing?.data.unitPrice ?? product.data.price;
        data.unitCost = existing?.data.unitCost ?? product.data.cost;
        data.amount = Math.round(Number(data.unitPrice) * Number(data.quantity) * 100) / 100;
        data.supplierId = product.data.supplierId;
        data.stockReserved = ['Confirmed', 'Dispatched', 'Delivered'].includes(String(data.status));
      }
    }

    const kind = String(body.kind || 'record');
    const next: CareRecord = {
      id,
      kind,
      data,
      revision: (existing?.revision || 0) + 1,
      created_at: existing?.created_at || now,
      updated_at: now,
      patient_id: String(data.patientId || ''),
      supplier_id: String(data.supplierId || ''),
    };
    state.records = existing
      ? state.records.map((item) => (item.id === id ? next : item))
      : [next, ...state.records];
    audit(state, id, existing ? 'updated' : 'created', `${kind}: ${data.name || id.slice(0, 8)}`);
    saveBrowserDemo(state);
    return { id };
  }

  if (route === 'billing-run') {
    const { month } = bodyJson(options);
    let created = 0;
    for (const patient of state.records.filter((item) => item.kind === 'patients' && item.data.status !== 'Inactive' && item.data.funding !== 'NHS')) {
      const plan = state.records.find((item) => item.kind === 'plans' && item.id === patient.data.planId && item.data.status === 'Active');
      if (!plan || !month || state.records.some((item) => item.kind === 'invoices' && item.data.patientId === patient.id && String(item.data.description).includes(month))) continue;
      const id = `local-${crypto.randomUUID()}`;
      const now = new Date().toISOString();
      const data: Data = {
        name: `INV-${String(month).replace('-', '')}-${id.slice(-6).toUpperCase()}`,
        patientId: patient.id,
        description: `${plan.data.name} coordination plan · ${month}`,
        amount: plan.data.monthlyPrice,
        due: `${month}-28`,
        status: 'Draft',
        paymentReference: '',
      };
      state.records.unshift({ id, kind: 'invoices', data, revision: 1, created_at: now, updated_at: now, patient_id: patient.id });
      audit(state, id, 'created', String(data.name));
      created += 1;
    }
    saveBrowserDemo(state);
    return { created };
  }

  if (route === 'members') {
    const data = bodyJson(options);
    const id = data.id || `member-${crypto.randomUUID()}`;
    const member = {
      id,
      name: String(data.name || ''),
      email: String(data.email || ''),
      role: String(data.role || 'coordinator'),
      patient_ids: JSON.stringify(data.patientIds || []),
      supplier_id: data.supplierId || '',
      active: data.active ? 1 : 0,
    };
    state.members = state.members.some((item) => item.id === id)
      ? state.members.map((item) => (item.id === id ? member : item))
      : [member, ...state.members];
    audit(state, id, 'access updated', `${data.name || 'Member'} · ${data.role || 'coordinator'}`);
    saveBrowserDemo(state);
    return { id };
  }

  if (route === 'documents') {
    if (!(options?.body instanceof FormData)) throw new Error('Choose a document to upload.');
    const file = options.body.get('file');
    const patientId = String(options.body.get('patientId') || '');
    if (!(file instanceof File)) throw new Error('Choose a document to upload.');
    if (file.size > 750_000) throw new Error('For this browser demo, choose a file smaller than 750 KB.');
    const id = `local-${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    const data = { name: file.name, patientId, size: file.size, type: file.type, downloadUrl: await fileDataUrl(file) };
    state.records.unshift({ id, kind: 'documents', data, revision: 1, created_at: now, updated_at: now, patient_id: patientId });
    audit(state, id, 'uploaded', file.name);
    saveBrowserDemo(state);
    return { id };
  }

  if (route === 'workspaces') throw new Error('Connect production identity and storage before creating a live clinic workspace.');
  if (route === 'checkout') throw new Error('Card payments are disabled in the demonstration workspace.');
  throw new Error('This connection is not available in the browser demonstration.');
}
