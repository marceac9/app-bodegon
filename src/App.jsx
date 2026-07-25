import { supabase } from './supabaseClient';
import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, Lock, Plus, Minus, Trash2, Printer, X, Users, Check,
  Loader2, Pencil, ChefHat, Wine, UtensilsCrossed, ShieldCheck
} from 'lucide-react';

const ADMIN_PIN = '1234';

const SEED_PRODUCTOS = [
  { id: 101, nombre: 'Cerveza Tirada', categoria: 'Bebida', precio: 2500 },
  { id: 102, nombre: 'Hamburguesa', categoria: 'Comida', precio: 6000 },
  { id: 103, nombre: 'Pastas', categoria: 'Comida', precio: 5000 },
  { id: 104, nombre: 'Helado', categoria: 'Postre', precio: 3000 },
];

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&family=Caveat:wght@600;700&display=swap');

:root {
  --ink: #1F2E3D;
  --bg: #EEE9DC;
  --surface: #FFFDF8;
  --accent: #C6922E;
  --libre: #3E8659;
  --libre-bg: #E3F0E6;
  --ocupada: #B33A3A;
  --ocupada-bg: #F6E4E2;
  --text: #241F18;
  --text-muted: #7C7261;
  --border: #DEDBC9;
}

.bc-app * { box-sizing: border-box; }
.bc-app {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  width: 100%;
  max-width: 480px;
  position: relative;
  overflow-x: hidden;
}
.bc-display { font-family: 'Oswald', sans-serif; }
.bc-script { font-family: 'Caveat', cursive; }

.bc-header {
  position: sticky; top: 0; z-index: 20;
  background: var(--ink); color: var(--surface);
  padding: 14px 16px; display: flex; align-items: center; gap: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.18);
}
.banner-error { background: var(--ocupada-bg); color: var(--ocupada); font-size: 12.5px; text-align: center; padding: 8px 12px; }

.role-btn, .role-badge-active {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: 'Oswald', sans-serif; font-size: 12px; letter-spacing: .03em; text-transform: uppercase;
  padding: 8px 12px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.25);
  background: rgba(255,255,255,0.1); color: var(--surface); white-space: nowrap; cursor: pointer;
}
.role-btn-active, .role-badge-active { background: var(--accent); border-color: var(--accent); color: #241505; }

.icon-btn-ghost {
  background: transparent; border: none; color: inherit; padding: 6px;
  display: flex; align-items: center; justify-content: center; border-radius: 8px; flex-shrink: 0; cursor: pointer;
}

.section-label {
  font-family: 'Oswald', sans-serif; font-size: 12px; letter-spacing: .08em; text-transform: uppercase;
  color: var(--text-muted); margin: 16px 2px 6px;
}

.table-card {
  background: var(--surface); border-radius: 16px; border: 1px solid var(--border);
  padding: 14px; display: flex; flex-direction: column; gap: 8px; cursor: pointer;
  border-top: 5px solid var(--border);
  transition: transform .15s ease, border-color .3s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}
.table-card:active { transform: scale(0.97); }
.table-card.libre { border-top-color: var(--libre); }
.table-card.ocupada { border-top-color: var(--ocupada); }
@keyframes statusPop { 0% { transform: scale(1); } 40% { transform: scale(1.045); } 100% { transform: scale(1); } }
.status-changed { animation: statusPop .45s ease; }

.status-pill {
  display: inline-flex; align-items: center; font-family: 'Oswald', sans-serif; font-size: 11px;
  letter-spacing: .05em; padding: 4px 9px; border-radius: 999px; font-weight: 600; flex-shrink: 0;
}
.status-pill.libre { background: var(--libre-bg); color: var(--libre); }
.status-pill.ocupada { background: var(--ocupada-bg); color: var(--ocupada); }

.chips-row { display: flex; gap: 8px; overflow-x: auto; padding: 14px 16px 4px; scrollbar-width: none; }
.chips-row::-webkit-scrollbar { display: none; }
.chip {
  font-family: 'Oswald', sans-serif; font-size: 13px; letter-spacing: .02em; padding: 8px 15px;
  border-radius: 999px; border: 1.5px solid var(--border); background: var(--surface); color: var(--text-muted);
  white-space: nowrap; flex-shrink: 0; cursor: pointer;
}
.chip.active { background: var(--ink); border-color: var(--ink); color: var(--surface); }

.menu-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 2px; border-bottom: 1px solid var(--border); gap: 10px; }
.menu-row:last-child { border-bottom: none; }
.menu-icon { width: 32px; height: 32px; border-radius: 9px; background: var(--bg); color: var(--ink); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.btn-add-round { width: 36px; height: 36px; border-radius: 50%; background: var(--ink); color: var(--surface); border: none; display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; }
.btn-add-round:active { transform: scale(0.9); }

.pedido-row { display: flex; align-items: center; gap: 8px; padding: 10px 2px; border-bottom: 1px solid var(--border); }
.pedido-row:last-child { border-bottom: none; }
.stepper { display: flex; align-items: center; gap: 6px; background: var(--bg); border-radius: 10px; padding: 3px 5px; flex-shrink: 0; }
.stepper button { width: 24px; height: 24px; border: none; background: var(--surface); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: var(--ink); cursor: pointer; }
.stepper span { min-width: 16px; text-align: center; font-weight: 700; font-size: 13px; }

.bottom-bar {
  position: fixed; bottom: 0; left: 0; right: 0; max-width: 480px; margin: 0 auto;
  background: var(--ink); padding: 14px 16px; display: flex; justify-content: space-between; align-items: center;
  z-index: 30; box-shadow: 0 -2px 12px rgba(0,0,0,0.18);
}

.btn {
  font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: .03em; font-weight: 600;
  border: none; border-radius: 12px; padding: 12px 18px; display: inline-flex; align-items: center;
  justify-content: center; gap: 8px; cursor: pointer; font-size: 13.5px;
}
.btn:active { transform: scale(0.97); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
.btn-primary { background: var(--accent); color: #241505; }
.btn-success { background: var(--libre); color: #fff; }
.btn-outline { background: transparent; border: 1.5px solid var(--border); color: var(--text); }
.btn-outline-dark { background: transparent; border: 1.5px solid rgba(255,255,255,0.35); color: var(--surface); padding: 12px 14px; }

.admin-row { display: flex; align-items: center; gap: 8px; padding: 10px 4px; border-bottom: 1px solid var(--border); }
.admin-row:last-child { border-bottom: none; }
.icon-btn { width: 34px; height: 34px; border-radius: 9px; border: 1px solid var(--border); background: var(--surface); display: flex; align-items: center; justify-content: center; color: var(--text); flex-shrink: 0; cursor: pointer; }
.icon-btn-danger { color: var(--ocupada); border-color: var(--ocupada-bg); }
.mesa-chip-admin { display: flex; align-items: center; gap: 8px; background: var(--surface); border: 1px solid var(--border); border-radius: 999px; padding: 7px 6px 7px 13px; font-size: 12.5px; }
.mesa-chip-admin button { width: 20px; height: 20px; border-radius: 50%; border: none; background: var(--ocupada-bg); color: var(--ocupada); display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; }
.aviso { background: var(--ocupada-bg); color: var(--ocupada); padding: 9px 12px; border-radius: 9px; font-size: 12.5px; margin-bottom: 12px; }

.form-field { margin-bottom: 12px; }
.form-field label { display: block; font-family: 'Oswald', sans-serif; font-size: 11.5px; letter-spacing: .04em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 5px; }
.form-field input { width: 100%; padding: 11px 12px; border-radius: 10px; border: 1.5px solid var(--border); font-size: 14.5px; font-family: 'Inter', sans-serif; background: var(--surface); color: var(--text); }
.form-field input:focus { outline: none; border-color: var(--accent); }

.pin-input { width: 100%; font-size: 30px; letter-spacing: 16px; text-align: center; padding: 14px 10px 14px 20px; border-radius: 12px; border: 1.5px solid var(--border); font-family: 'Oswald', sans-serif; color: var(--text); background: var(--surface); }
.pin-input:focus { outline: none; border-color: var(--accent); }

.modal-overlay { position: fixed; inset: 0; background: rgba(31,46,61,0.55); display: flex; align-items: flex-end; justify-content: center; z-index: 50; }
.modal-sheet { background: var(--surface); width: 100%; max-width: 480px; border-radius: 20px 20px 0 0; padding: 20px; max-height: 85vh; overflow-y: auto; animation: slideUp .25s ease; }
@keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.ticket { font-family: 'Inter', monospace; background: #fff; color: #171310; padding: 16px; border-radius: 8px; border: 1px dashed #B8AF9C; }
.ticket-row { display: flex; justify-content: space-between; font-size: 13px; padding: 3px 0; gap: 10px; }
.ticket-divider { border-top: 1px dashed #B8AF9C; margin: 8px 0; }

.bc-app button, .bc-app input { font-family: inherit; }
.bc-app button:focus-visible, .bc-app input:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  .bc-app * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}

@media print {
  body * { visibility: hidden; }
  #recibo-print, #recibo-print * { visibility: visible; }
  #recibo-print { position: fixed; top: 0; left: 0; width: 78mm; padding: 4mm; border: none; }
}
`;

function formatMoney(n) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n || 0);
}

function tiempoAbierta(abiertoEn) {
  if (!abiertoEn) return '';
  const mins = Math.max(0, Math.floor((Date.now() - abiertoEn) / 60000));
  if (mins < 1) return 'recién abierta';
  if (mins < 60) return `hace ${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `hace ${h}h ${m}min`;
}

function agruparPorCategoria(productos) {
  return productos.reduce((acc, p) => {
    const cat = p.categoria || 'Sin categoría';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});
}

function getCategoryIcon(categoria) {
  const key = (categoria || '').toLowerCase();
  if (key.includes('comid')) return ChefHat;
  if (key.includes('bebid')) return Wine;
  return UtensilsCrossed;
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <Loader2 size={26} className="animate-spin" style={{ color: 'var(--accent)' }} />
      <div style={{ fontFamily: 'Oswald', fontSize: 12.5, letterSpacing: '.06em', color: 'var(--text-muted)' }}>CARGANDO MESAS…</div>
    </div>
  );
}

function Header({ vista, mesa, rol, onBack, onAbrirLoginAdmin, onIrAdmin }) {
  return (
    <div className="bc-header">
      {vista !== 'grid' && (
        <button className="icon-btn-ghost" onClick={onBack} aria-label="Volver">
          <ArrowLeft size={22} />
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        {vista === 'grid' && (
          <>
            <div className="bc-script" style={{ fontSize: 27, lineHeight: 1, color: 'var(--accent)' }}>Bodegón Coco</div>
            <div className="bc-display" style={{ fontSize: 11.5, opacity: 0.75, letterSpacing: '.05em', textTransform: 'uppercase', marginTop: 2 }}>Mesas</div>
          </>
        )}
        {vista === 'mesa' && mesa && (
          <>
            <div className="bc-display" style={{ fontSize: 19, fontWeight: 600 }}>Mesa {mesa.numero}</div>
            <div style={{ fontSize: 12, opacity: 0.75, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Users size={12} /> {mesa.capacidad} · {mesa.estado === 'Ocupada' ? tiempoAbierta(mesa.pedido && mesa.pedido.abiertoEn) : 'Libre'}
            </div>
          </>
        )}
        {vista === 'admin' && <div className="bc-display" style={{ fontSize: 19, fontWeight: 600 }}>Panel admin</div>}
      </div>
      <div>
        {rol === 'mozo' ? (
          <button className="role-btn" onClick={onAbrirLoginAdmin}>
            <Lock size={13} /> Admin
          </button>
        ) : vista !== 'admin' ? (
          <button className="role-btn role-btn-active" onClick={onIrAdmin}>
            <ShieldCheck size={13} /> Panel admin
          </button>
        ) : (
          <span className="role-badge-active">
            <ShieldCheck size={13} /> Admin
          </span>
        )}
      </div>
    </div>
  );
}

function TableCard({ mesa, onClick, justChanged }) {
  const ocupada = mesa.estado === 'Ocupada';
  const total = mesa.pedido ? mesa.pedido.items.reduce((a, it) => a + it.precioUnit * it.cantidad, 0) : 0;
  return (
    <div
      className={`table-card ${ocupada ? 'ocupada' : 'libre'} ${justChanged ? 'status-changed' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="bc-display" style={{ fontSize: 30, fontWeight: 600, lineHeight: 1 }}>{mesa.numero}</div>
        <span className={`status-pill ${ocupada ? 'ocupada' : 'libre'}`}>{ocupada ? 'OCUPADA' : 'LIBRE'}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Users size={12} /> {mesa.capacidad}
      </div>
      {ocupada && (
        <div style={{ marginTop: 2 }}>
          <div className="bc-display" style={{ fontSize: 17, fontWeight: 600, color: 'var(--ocupada)' }}>{formatMoney(total)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tiempoAbierta(mesa.pedido && mesa.pedido.abiertoEn)}</div>
        </div>
      )}
    </div>
  );
}

function GridMesas({ mesas, onAbrirMesa, justChanged }) {
  const libres = mesas.filter((m) => m.estado === 'Libre').length;
  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 14 }}>
        {libres} libres · {mesas.length - libres} ocupadas
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))', gap: 12 }}>
        {mesas.map((m) => (
          <TableCard key={m.id} mesa={m} onClick={() => onAbrirMesa(m.id)} justChanged={justChanged === m.id} />
        ))}
      </div>
      {mesas.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: 14 }}>
          Todavía no hay mesas cargadas. Pedile al admin que agregue desde el panel.
        </div>
      )}
    </div>
  );
}

function DetalleMesa({ mesa, productos, categorias, categoriaFiltro, onFiltrar, onAgregarItem, onCambiarCantidad, onQuitarItem, onAbrirRecibo, onAbrirCobrar }) {
  const items = mesa.pedido ? mesa.pedido.items : [];
  const total = items.reduce((a, it) => a + it.precioUnit * it.cantidad, 0);
  const productosFiltrados = categoriaFiltro === 'Todas' ? productos : productos.filter((p) => p.categoria === categoriaFiltro);

  return (
    <div style={{ paddingBottom: 100 }}>
      <div className="chips-row">
        {categorias.map((c) => (
          <button key={c} className={`chip ${categoriaFiltro === c ? 'active' : ''}`} onClick={() => onFiltrar(c)}>
            {c}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 16px' }}>
        <div className="section-label">Carta</div>
        {productosFiltrados.length === 0 && (
          <div style={{ padding: '16px 0', color: 'var(--text-muted)', fontSize: 14 }}>No hay productos en esta categoría.</div>
        )}
        {productosFiltrados.map((p) => {
          const Icon = getCategoryIcon(p.categoria);
          return (
            <div key={p.id} className="menu-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <div className="menu-icon"><Icon size={16} /></div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14.5 }}>{p.nombre}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{formatMoney(p.precio)}</div>
                </div>
              </div>
              <button className="btn-add-round" onClick={() => onAgregarItem(p)} aria-label={`Agregar ${p.nombre}`}>
                <Plus size={18} />
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '4px 16px 0' }}>
        <div className="section-label">Pedido actual</div>
        {items.length === 0 ? (
          <div style={{ padding: '16px 0', color: 'var(--text-muted)', fontSize: 14 }}>Todavía no agregaste nada de la carta.</div>
        ) : (
          items.map((it) => (
            <div key={it.productId} className="pedido-row">
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{it.nombre}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatMoney(it.precioUnit)} c/u</div>
              </div>
              <div className="stepper">
                <button onClick={() => onCambiarCantidad(it.productId, -1)} aria-label="Restar unidad"><Minus size={14} /></button>
                <span>{it.cantidad}</span>
                <button onClick={() => onCambiarCantidad(it.productId, 1)} aria-label="Sumar unidad"><Plus size={14} /></button>
              </div>
              <div className="bc-display" style={{ width: 70, textAlign: 'right', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
                {formatMoney(it.precioUnit * it.cantidad)}
              </div>
              <button className="icon-btn-ghost" onClick={() => onQuitarItem(it.productId)} aria-label={`Quitar ${it.nombre}`} style={{ color: 'var(--ocupada)' }}>
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="bottom-bar">
        <div>
          <div style={{ fontSize: 10.5, color: 'var(--surface)', opacity: 0.7, letterSpacing: '.06em' }}>TOTAL</div>
          <div className="bc-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--surface)' }}>{formatMoney(total)}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline-dark" onClick={onAbrirRecibo} disabled={items.length === 0} aria-label="Imprimir ticket">
            <Printer size={16} />
          </button>
          <button className="btn btn-primary" onClick={onAbrirCobrar} disabled={items.length === 0}>
            <Check size={16} /> Cobrar
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalWrapper({ children, onClose, titulo }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="bc-display" style={{ fontSize: 16, fontWeight: 600 }}>{titulo}</div>
          <button className="icon-btn-ghost" onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PinModal({ pinInput, setPinInput, pinError, onConfirmar, onClose }) {
  return (
    <ModalWrapper titulo="Acceso admin" onClose={onClose}>
      <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginBottom: 14, marginTop: 0 }}>
        Ingresá el PIN de administrador para editar productos, precios y mesas.
      </p>
      <input
        type="password"
        inputMode="numeric"
        maxLength={4}
        className="pin-input"
        value={pinInput}
        onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
        onKeyDown={(e) => { if (e.key === 'Enter') onConfirmar(); }}
        placeholder="••••"
        autoFocus
      />
      {pinError && <div style={{ color: 'var(--ocupada)', fontSize: 12.5, marginTop: 8 }}>PIN incorrecto. Probá de nuevo.</div>}
      <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={onConfirmar}>Ingresar</button>
    </ModalWrapper>
  );
}

function ReciboModal({ mesa, onClose, onImprimir }) {
  const items = mesa.pedido ? mesa.pedido.items : [];
  const total = items.reduce((a, it) => a + it.precioUnit * it.cantidad, 0);
  const fecha = new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
  return (
    <ModalWrapper titulo="Ticket" onClose={onClose}>
      <div id="recibo-print" className="ticket">
        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <div className="bc-display" style={{ fontSize: 16, fontWeight: 700 }}>BODEGÓN COCO</div>
          <div style={{ fontSize: 11 }}>Mesa {mesa.numero} · {fecha}</div>
        </div>
        <div className="ticket-divider" />
        {items.map((it) => (
          <div key={it.productId} className="ticket-row">
            <span>{it.cantidad} x {it.nombre}</span>
            <span>{formatMoney(it.precioUnit * it.cantidad)}</span>
          </div>
        ))}
        <div className="ticket-divider" />
        <div className="ticket-row" style={{ fontWeight: 700, fontSize: 15 }}>
          <span>TOTAL</span>
          <span>{formatMoney(total)}</span>
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, marginTop: 10, color: '#555' }}>¡Gracias por su visita!</div>
      </div>
      <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={onImprimir}>
        <Printer size={16} /> Imprimir
      </button>
    </ModalWrapper>
  );
}

function ConfirmarCobroModal({ mesa, onCancelar, onConfirmar }) {
  const total = mesa.pedido ? mesa.pedido.items.reduce((a, it) => a + it.precioUnit * it.cantidad, 0) : 0;
  return (
    <ModalWrapper titulo="Cobrar mesa" onClose={onCancelar}>
      <p style={{ fontSize: 14, marginBottom: 4, marginTop: 0 }}>
        Vas a cerrar la <strong>Mesa {mesa.numero}</strong> con un total de:
      </p>
      <div className="bc-display" style={{ fontSize: 28, fontWeight: 700, margin: '8px 0 18px' }}>{formatMoney(total)}</div>
      <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 18 }}>
        La mesa va a quedar libre y el pedido se va a borrar de la pantalla.
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={onCancelar}>Cancelar</button>
        <button className="btn btn-success" style={{ flex: 1 }} onClick={onConfirmar}><Check size={16} /> Confirmar</button>
      </div>
    </ModalWrapper>
  );
}

function ProductoFormModal({ producto, categoriasExistentes, onGuardar, onClose }) {
  const [nombre, setNombre] = useState(producto ? producto.nombre : '');
  const [categoria, setCategoria] = useState(producto ? producto.categoria : '');
  const [precio, setPrecio] = useState(producto ? String(producto.precio) : '');
  const [error, setError] = useState('');

  function handleGuardar() {
    if (!nombre.trim()) { setError('Ponele un nombre al producto.'); return; }
    if (!categoria.trim()) { setError('Elegí o escribí una categoría.'); return; }
    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum < 0) { setError('El precio tiene que ser un número válido.'); return; }
    onGuardar({ nombre: nombre.trim(), categoria: categoria.trim(), precio: precioNum });
  }

  return (
    <ModalWrapper titulo={producto ? 'Editar producto' : 'Nuevo producto'} onClose={onClose}>
      <div className="form-field">
        <label>Nombre</label>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Milanesa napolitana" autoFocus />
      </div>
      <div className="form-field">
        <label>Categoría</label>
        <input value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Ej: Comida" list="categorias-existentes" />
        <datalist id="categorias-existentes">
          {categoriasExistentes.map((c) => <option key={c} value={c} />)}
        </datalist>
      </div>
      <div className="form-field">
        <label>Precio</label>
        <input type="number" inputMode="decimal" min="0" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="0" />
      </div>
      {error && <div style={{ color: 'var(--ocupada)', fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
      <button className="btn btn-primary" style={{ width: '100%', marginTop: 6 }} onClick={handleGuardar}>Guardar</button>
    </ModalWrapper>
  );
}

function PanelAdmin({ productos, mesas, onSalir, onNuevoProducto, onEditarProducto, onEliminarProducto, onAgregarMesa, onEliminarMesa, avisoMesas }) {
  const grupos = agruparPorCategoria(productos);
  return (
    <div style={{ padding: 16, paddingBottom: 40 }}>
      <button className="btn btn-outline" style={{ width: '100%', marginBottom: 20 }} onClick={onSalir}>Salir de modo admin</button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div className="bc-display" style={{ fontSize: 15, fontWeight: 600 }}>Productos y precios</div>
        <button className="btn btn-primary" style={{ padding: '8px 12px', fontSize: 12 }} onClick={onNuevoProducto}>
          <Plus size={14} /> Nuevo
        </button>
      </div>

      {Object.keys(grupos).length === 0 && (
        <div style={{ padding: '16px 0', color: 'var(--text-muted)', fontSize: 14 }}>No hay productos cargados todavía.</div>
      )}

      {Object.entries(grupos).map(([cat, items]) => (
        <div key={cat}>
          <div className="section-label">{cat}</div>
          {items.map((p) => (
            <div key={p.id} className="admin-row">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.nombre}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{formatMoney(p.precio)}</div>
              </div>
              <button className="icon-btn" onClick={() => onEditarProducto(p)} aria-label={`Editar ${p.nombre}`}><Pencil size={15} /></button>
              <button className="icon-btn icon-btn-danger" onClick={() => onEliminarProducto(p.id)} aria-label={`Eliminar ${p.nombre}`}><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '26px 0 10px' }}>
        <div className="bc-display" style={{ fontSize: 15, fontWeight: 600 }}>Mesas</div>
        <button className="btn btn-primary" style={{ padding: '8px 12px', fontSize: 12 }} onClick={onAgregarMesa}>
          <Plus size={14} /> Agregar mesa
        </button>
      </div>
      {avisoMesas && <div className="aviso">{avisoMesas}</div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {mesas.map((m) => (
          <div key={m.id} className="mesa-chip-admin">
            <span>Mesa {m.numero} · {m.capacidad}p</span>
            <button onClick={() => onEliminarMesa(m.id)} aria-label={`Eliminar mesa ${m.numero}`}><X size={13} /></button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 30, fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        Los cambios de productos, precios y mesas se guardan para todos los que tengan esta app abierta. El PIN de admin es solo una traba de uso para esta demo — para producción hace falta un login real por usuario.
      </div>
    </div>
  );
}

export default function BodegonCocoApp() {
  const [cargando, setCargando] = useState(true);
  const [productos, setProductos] = useState(SEED_PRODUCTOS);
  const [mesas, setMesas] = useState([]);
  const [rol, setRol] = useState('mozo');
  const [vista, setVista] = useState('grid');
  const [mesaActivaId, setMesaActivaId] = useState(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [modal, setModal] = useState(null);
  const [productoEditando, setProductoEditando] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [justChanged, setJustChanged] = useState(null);
  const [errorSync, setErrorSync] = useState(false);
  const [avisoMesas, setAvisoMesas] = useState('');
  const [, setTick] = useState(0);

  // 1. Guardar cambios de mesa en Supabase
  const guardarMesaDB = async (mesaId, nuevoEstado, nuevoPedido) => {
    try {
      const { error } = await supabase
        .from('mesas')
        .update({
          estado: nuevoEstado,
          pedido: nuevoPedido
        })
        .eq('id', mesaId);

      if (error) throw error;
      setErrorSync(false);
    } catch (e) {
      console.error("Error guardando en Supabase:", e);
      setErrorSync(true);
    }
  };

  useEffect(() => {
    const cargarInicial = async () => {
      try {
        const { data: mesasDB, error: errorMesas } = await supabase
          .from('mesas')
          .select('*')
          .order('id');

        if (!errorMesas && mesasDB) {
          setMesas(mesasDB);
        }
      } catch (err) {
        console.error("Error al cargar datos iniciales:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarInicial();

    // 2. Escuchar cambios en vivo (Sincronización en tiempo real)
    const canal = supabase
      .channel('mesas-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mesas' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMesas((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setMesas((prev) =>
              prev.map((m) => (m.id === payload.new.id ? payload.new : m))
            );
          } else if (payload.eventType === 'DELETE') {
            setMesas((prev) => prev.filter((m) => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const categorias = useMemo(() => {
    const set = new Set(productos.map((p) => p.categoria).filter(Boolean));
    return ['Todas', ...Array.from(set)];
  }, [productos]);

  const mesaActiva = useMemo(() => mesas.find((m) => m.id === mesaActivaId) || null, [mesas, mesaActivaId]);

  function abrirMesa(mesaId) {
    setMesaActivaId(mesaId);
    setCategoriaFiltro('Todas');
    setVista('mesa');
  }

  function volverAGrid() {
    setVista('grid');
    setMesaActivaId(null);
  }

  function agregarItem(producto) {
    const mesaActual = mesas.find((m) => m.id === mesaActivaId);
    if (!mesaActual) return;
    const eraLibre = mesaActual.estado === 'Libre';
    
    let nuevoPedido;
    if (mesaActual.pedido) {
      // Ya tiene pedido, lo clonamos para modificarlo
      nuevoPedido = { ...mesaActual.pedido, items: [...mesaActual.pedido.items] };
      const idx = nuevoPedido.items.findIndex((it) => it.productId === producto.id);
      if (idx >= 0) {
        nuevoPedido.items[idx] = { ...nuevoPedido.items[idx], cantidad: nuevoPedido.items[idx].cantidad + 1 };
      } else {
        nuevoPedido.items.push({ productId: producto.id, nombre: producto.nombre, precioUnit: producto.precio, cantidad: 1 });
      }
    } else {
      // Es el primer item que se agrega
      nuevoPedido = {
        abiertoEn: Date.now(),
        items: [{ productId: producto.id, nombre: producto.nombre, precioUnit: producto.precio, cantidad: 1 }]
      };
    }

    // 1. Actualizar local
    setMesas((prev) => prev.map((m) => m.id === mesaActivaId ? { ...m, estado: 'Ocupada', pedido: nuevoPedido } : m));
    
    // 2. Enviar a Supabase
    guardarMesaDB(mesaActivaId, 'Ocupada', nuevoPedido);

    if (eraLibre) {
      setJustChanged(mesaActivaId);
      setTimeout(() => setJustChanged(null), 450);
    }
  }

  function cambiarCantidad(productId, delta) {
    const mesaActual = mesas.find((m) => m.id === mesaActivaId);
    if (!mesaActual || !mesaActual.pedido) return;

    const itemsActualizados = mesaActual.pedido.items
      .map((it) => (it.productId === productId ? { ...it, cantidad: it.cantidad + delta } : it))
      .filter((it) => it.cantidad > 0);

    const nuevoPedido = { ...mesaActual.pedido, items: itemsActualizados };

    // 1. Actualizar local
    setMesas((prev) => prev.map((m) => m.id === mesaActivaId ? { ...m, pedido: nuevoPedido } : m));
    
    // 2. Enviar a Supabase
    guardarMesaDB(mesaActivaId, 'Ocupada', nuevoPedido);
  }

  function quitarItem(productId) {
    const mesaActual = mesas.find((m) => m.id === mesaActivaId);
    if (!mesaActual || !mesaActual.pedido) return;

    const itemsActualizados = mesaActual.pedido.items.filter((it) => it.productId !== productId);
    const nuevoPedido = { ...mesaActual.pedido, items: itemsActualizados };

    // 1. Actualizar local
    setMesas((prev) => prev.map((m) => m.id === mesaActivaId ? { ...m, pedido: nuevoPedido } : m));
    
    // 2. Enviar a Supabase
    guardarMesaDB(mesaActivaId, 'Ocupada', nuevoPedido);
  }

  function cobrarYCerrar() {
    // 1. Actualizar local
    setMesas((prev) => prev.map((m) => m.id === mesaActivaId ? { ...m, estado: 'Libre', pedido: null } : m));
    
    // 2. Enviar a Supabase
    guardarMesaDB(mesaActivaId, 'Libre', null);
    
    setModal(null);
    volverAGrid();
  }

  function imprimirTicket() {
    window.print();
  }

  function intentarLoginAdmin() {
    if (pinInput === ADMIN_PIN) {
      setRol('admin');
      setModal(null);
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
      setPinInput('');
    }
  }

  function salirDeAdmin() {
    setRol('mozo');
    if (vista === 'admin') setVista('grid');
  }

  function guardarProducto(datos) {
    let next;
    if (productoEditando) {
      next = productos.map((p) => (p.id === productoEditando.id ? { ...p, ...datos } : p));
    } else {
      const nuevoId = Math.max(0, ...productos.map((p) => p.id)) + 1;
      next = [...productos, { id: nuevoId, ...datos }];
    }
    setProductos(next); // Para los productos por ahora usamos el estado local
    setModal(null);
    setProductoEditando(null);
  }

  function eliminarProducto(id) {
    setProductos(productos.filter((p) => p.id !== id));
  }

  async function agregarMesa() {
    const nuevoNumero = mesas.length > 0 ? Math.max(...mesas.map((m) => m.numero)) + 1 : 1;
    const nuevoId = mesas.length > 0 ? Math.max(...mesas.map((m) => m.id)) + 1 : 1;
    
    const nuevaMesa = { id: nuevoId, numero: nuevoNumero, capacidad: 4, estado: 'Libre', pedido: null };
    
    // Actualización local rápida
    setMesas((prev) => [...prev, nuevaMesa]);
    
    // Impactar en DB
    const { error } = await supabase.from('mesas').insert([nuevaMesa]);
    if (error) {
      console.error("Error agregando mesa a Supabase:", error);
      setErrorSync(true);
    }
  }

  async function eliminarMesa(id) {
    const m = mesas.find((x) => x.id === id);
    if (m && m.estado === 'Ocupada') {
      setAvisoMesas('No se puede eliminar una mesa ocupada. Cerrá la cuenta primero.');
      setTimeout(() => setAvisoMesas(''), 3000);
      return;
    }
    
    // Actualización local rápida
    setMesas((prev) => prev.filter((x) => x.id !== id));
    
    // Impactar en DB
    const { error } = await supabase.from('mesas').delete().eq('id', id);
    if (error) {
      console.error("Error eliminando mesa de Supabase:", error);
      setErrorSync(true);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#DCD5C4', display: 'flex', justifyContent: 'center' }}>
      <div className="bc-app">
        <style>{STYLES}</style>

        {cargando ? (
          <LoadingScreen />
        ) : (
          <>
            <Header
              vista={vista}
              mesa={mesaActiva}
              rol={rol}
              onBack={volverAGrid}
              onAbrirLoginAdmin={() => { setPinError(false); setPinInput(''); setModal('pin'); }}
              onIrAdmin={() => setVista('admin')}
            />

            {errorSync && <div className="banner-error">No se pudo guardar el último cambio. Revisá tu conexión.</div>}

            {vista === 'grid' && <GridMesas mesas={mesas} onAbrirMesa={abrirMesa} justChanged={justChanged} />}

            {vista === 'mesa' && mesaActiva && (
              <DetalleMesa
                mesa={mesaActiva}
                productos={productos}
                categorias={categorias}
                categoriaFiltro={categoriaFiltro}
                onFiltrar={setCategoriaFiltro}
                onAgregarItem={agregarItem}
                onCambiarCantidad={cambiarCantidad}
                onQuitarItem={quitarItem}
                onAbrirRecibo={() => setModal('recibo')}
                onAbrirCobrar={() => setModal('cobrar')}
              />
            )}
            {vista === 'mesa' && !mesaActiva && (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                Esta mesa ya no existe.
                <div style={{ marginTop: 14 }}>
                  <button className="btn btn-outline" onClick={volverAGrid}>Volver a mesas</button>
                </div>
              </div>
            )}

            {vista === 'admin' && rol === 'admin' && (
              <PanelAdmin
                productos={productos}
                mesas={mesas}
                onSalir={salirDeAdmin}
                onNuevoProducto={() => { setProductoEditando(null); setModal('producto'); }}
                onEditarProducto={(p) => { setProductoEditando(p); setModal('producto'); }}
                onEliminarProducto={eliminarProducto}
                onAgregarMesa={agregarMesa}
                onEliminarMesa={eliminarMesa}
                avisoMesas={avisoMesas}
              />
            )}
          </>
        )}

        {modal === 'pin' && (
          <PinModal pinInput={pinInput} setPinInput={setPinInput} pinError={pinError} onConfirmar={intentarLoginAdmin} onClose={() => setModal(null)} />
        )}
        {modal === 'recibo' && mesaActiva && (
          <ReciboModal mesa={mesaActiva} onClose={() => setModal(null)} onImprimir={imprimirTicket} />
        )}
        {modal === 'cobrar' && mesaActiva && (
          <ConfirmarCobroModal mesa={mesaActiva} onCancelar={() => setModal(null)} onConfirmar={cobrarYCerrar} />
        )}
        {modal === 'producto' && (
          <ProductoFormModal
            producto={productoEditando}
            categoriasExistentes={categorias.filter((c) => c !== 'Todas')}
            onGuardar={guardarProducto}
            onClose={() => { setModal(null); setProductoEditando(null); }}
          />
        )}
      </div>
    </div>
  );
}