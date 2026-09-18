import React, { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, ClipboardCheck, Clock, FileUp, Plus, Upload, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Badge, Button } from '../components/UIComponents';

const initialForm = { nombre: '', descripcion: '', fecha_limite: '', tipo: 'GRUPAL', id_rubrica_docente: '', id_rubrica_coevaluacion: '', coevaluacion_activa: true, criterios: [], proyectos: [] };
const coevalScale = [0, 20, 40, 60, 80, 100];
const formatDate = (value) => new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));

const flattenCriteria = (nodes = [], parent = '') => nodes.flatMap((node) => {
  const children = node.hijos || [];
  const current = { ...node, parentNombre: parent };
  return children.length ? [current, ...flattenCriteria(children, node.nombre)] : [current];
});

export const Entregables = () => {
  const { user, userProjects, rubrics, showToast } = useApp();
  const [actividades, setActividades] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [selectedRubric, setSelectedRubric] = useState(null);
  const [files, setFiles] = useState({});
  const [ratings, setRatings] = useState({});
  const [teacherGrades, setTeacherGrades] = useState({});
  const esDocente = user?.rol === 'docente';
  const userId = user?.id_usuario || user?.id;
  const rubricasDocentes = rubrics.filter((item) => item.tipo !== 'COEVALUACION' && item.activa);
  const rubricasCoevaluacion = rubrics.filter((item) => item.tipo === 'COEVALUACION' && item.activa);

  const cargar = async () => {
    const response = await api.get('/actividades-entregables');
    if (response?.actividades) setActividades(response.actividades);
  };

  useEffect(() => { cargar(); }, []);

  const cambiarRubrica = (id) => {
    const rubric = rubricasDocentes.find((item) => String(item.id) === String(id));
    setSelectedRubric(rubric || null);
    setForm((prev) => ({ ...prev, id_rubrica_docente: id, criterios: [] }));
  };

  const toggle = (field, value) => setForm((prev) => ({ ...prev, [field]: prev[field].includes(value) ? prev[field].filter((item) => item !== value) : [...prev[field], value] }));

  const crear = async (event) => {
    event.preventDefault();
    const response = await api.post('/actividades-entregables', {
      ...form,
      id_rubrica_docente: Number(form.id_rubrica_docente),
      id_rubrica_coevaluacion: form.id_rubrica_coevaluacion ? Number(form.id_rubrica_coevaluacion) : null,
      criterios: form.criterios.map(Number),
      proyectos: form.proyectos.map(Number)
    });
    if (!response?.actividad) return showToast(response?.error || 'No se pudo crear la actividad', 'error');
    const publicacion = await api.patch(`/actividades-entregables/${response.actividad.id_actividad}/publicar`);
    if (!publicacion?.actividad) return showToast(publicacion?.error || 'No se pudo publicar la actividad', 'error');
    showToast('Actividad publicada a los grupos seleccionados');
    setForm(initialForm);
    setSelectedRubric(null);
    cargar();
  };

  const subir = async (entregaId) => {
    const selected = files[entregaId];
    if (!selected?.length) return;
    const data = new FormData();
    [...selected].forEach((file) => data.append('archivos', file));
    const response = await api.post(`/entregas/${entregaId}/archivos`, data, true);
    if (!response?.entrega) return showToast(response?.error || 'No se pudo subir la entrega', 'error');
    showToast('Entrega registrada');
    setFiles((prev) => ({ ...prev, [entregaId]: null }));
    cargar();
  };

  const enviarCoevaluacion = async (entregaId, idEvaluado, criterios) => {
    const respuestas = criterios.map((criterio) => {
      const criterioId = criterio.id_criterio ?? criterio.id;
      return { id_criterio: criterioId, calificacion_base: Number(ratings[`${entregaId}:${idEvaluado}:${criterioId}`] || 0) };
    });
    const response = await api.post(`/entregas/${entregaId}/coevaluaciones/${idEvaluado}`, { calificaciones: respuestas, observacion: '' });
    if (!response?.resultado) return showToast(response?.error || 'No se pudo enviar la coevaluación', 'error');
    showToast('Coevaluación enviada');
    cargar();
  };

  const guardarEvaluacion = async (entregaId, criterios) => {
    const calificaciones = criterios.map((criterio) => ({ id_criterio: criterio.id_criterio, nota: Number(teacherGrades[`${entregaId}:${criterio.id_criterio}`] || 0) }));
    const response = await api.post(`/entregas/${entregaId}/evaluacion-docente`, { calificaciones, retroalimentacion: 'Evaluación registrada según los criterios seleccionados para esta actividad.' });
    if (!response?.evaluacion) return showToast(response?.error || 'No se pudo guardar la evaluación', 'error');
    showToast('Nota base grupal guardada');
    cargar();
  };

  const renderCreation = () => {
    const leaves = flattenCriteria(selectedRubric?.criterios).filter((item) => item.esHoja !== false && !item.hijos?.length);
    return <form onSubmit={crear} className="rounded-[1.5rem] border border-[#eadfca] bg-[#fffdf8] p-5 sm:p-7 space-y-5 shadow-sm">
      <div className="flex justify-between"><div><p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#a77f2d]">Nueva actividad</p><h2 className="text-xl font-black text-[#201b16] mt-1">Publicar a mis grupos</h2></div><div className="w-10 h-10 rounded-2xl bg-[#f4e8c8] text-[#a77f2d] flex items-center justify-center"><Plus /></div></div>
      <div className="grid md:grid-cols-2 gap-3">
        <input required placeholder="Nombre de la actividad" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="field" />
        <input required type="datetime-local" value={form.fecha_limite} onChange={(e) => setForm({ ...form, fecha_limite: e.target.value })} className="field" />
        <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value, coevaluacion_activa: e.target.value === 'GRUPAL' })} className="field"><option value="GRUPAL">Entrega grupal</option><option value="INDIVIDUAL">Entrega individual</option></select>
        <select required value={form.id_rubrica_docente} onChange={(e) => cambiarRubrica(e.target.value)} className="field"><option value="">Rúbrica docente</option>{rubricasDocentes.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select>
        {form.tipo === 'GRUPAL' && <select required={form.coevaluacion_activa} value={form.id_rubrica_coevaluacion} onChange={(e) => setForm({ ...form, id_rubrica_coevaluacion: e.target.value })} className="field"><option value="">Rúbrica de coevaluación</option>{rubricasCoevaluacion.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select>}
      </div>
      <textarea required placeholder="Instrucciones para los grupos" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="field min-h-24 resize-y" />
      {selectedRubric && <div className="rounded-2xl border border-neutral-200 bg-white p-4"><div className="flex justify-between mb-3"><div><p className="text-sm font-extrabold">Criterios calificables</p><p className="text-xs text-neutral-500">Selecciona las hojas que se evaluarán en esta actividad.</p></div><span className="text-xs font-bold text-[#c8102e]">{form.criterios.length} seleccionados</span></div><div className="grid sm:grid-cols-2 gap-2">{leaves.map((item) => <label key={item.id} className="flex items-center gap-3 rounded-xl border border-neutral-200 px-3 py-2.5 hover:border-[#c8102e] cursor-pointer"><input type="checkbox" checked={form.criterios.includes(item.id)} onChange={() => toggle('criterios', item.id)} className="accent-[#c8102e]" /><span><span className="block text-sm font-bold">{item.nombre}</span>{item.parentNombre && <span className="text-[11px] text-neutral-400">{item.parentNombre} · {item.peso}%</span>}</span></label>)}</div></div>}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4"><div className="flex justify-between mb-3"><div><p className="text-sm font-extrabold">Grupos asignados</p><p className="text-xs text-neutral-500">La actividad se publicará a cada proyecto seleccionado.</p></div><span className="text-xs font-bold text-[#c8102e]">{form.proyectos.length} grupos</span></div><div className="grid sm:grid-cols-2 gap-2">{userProjects.map((project) => { const id = project.id_proyecto || project.id; return <label key={id} className="flex items-center gap-3 rounded-xl border border-neutral-200 px-3 py-2.5 hover:border-[#c8102e] cursor-pointer"><input type="checkbox" checked={form.proyectos.includes(id)} onChange={() => toggle('proyectos', id)} className="accent-[#c8102e]" /><span className="text-sm font-bold">{project.titulo}</span></label>; })}</div></div>
      <Button type="submit" variant="gold">Publicar actividad</Button>
    </form>;
  };

  const renderDelivery = (delivery) => <div className="mt-5 rounded-2xl border border-dashed border-[#cfc8bb] bg-[#fbfaf7] p-4"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><FileUp className="w-5 h-5 text-[#c8102e]" /><div><p className="text-sm font-bold">Sube las evidencias del grupo</p><p className="text-xs text-neutral-500">Puedes seleccionar varios archivos.</p></div></div><label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-neutral-200 text-sm font-bold cursor-pointer"><Upload className="w-4 h-4 text-[#c8102e]" />Elegir archivos<input type="file" multiple className="hidden" onChange={(e) => setFiles({ ...files, [delivery.id_entrega]: e.target.files })} /></label></div>{files[delivery.id_entrega]?.length > 0 && <div className="mt-3 flex items-center justify-between gap-3"><span className="text-xs text-neutral-500 truncate">{[...files[delivery.id_entrega]].map((file) => file.name).join(', ')}</span><Button type="button" variant="primary" onClick={() => subir(delivery.id_entrega)}>Subir entrega</Button></div>}</div>;

  const renderResults = (delivery) => {
    const resultados = delivery?.resultados_coevaluacion || [];
    if (!resultados.length) return null;
    const propios = resultados.find((resultado) => resultado.id_usuario === userId);
    return <section className="mt-5 pt-5 border-t border-neutral-200"><div className="flex items-center gap-2 mb-3"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><h3 className="font-extrabold">Resultados consolidados</h3></div>{esDocente ? <div className="grid sm:grid-cols-2 gap-2">{resultados.map((resultado) => <div key={resultado.id_resultado} className="rounded-xl bg-[#f8f7f4] border border-neutral-200 p-3"><p className="text-sm font-bold">{resultado.usuario.nombre}</p><p className="text-xs text-neutral-500 mt-1">Coevaluación: <strong>{Number(resultado.total_coevaluacion).toFixed(2)}%</strong> · Nota final: <strong>{resultado.nota_final === null ? 'Pendiente de nota base' : Number(resultado.nota_final).toFixed(2)}</strong></p></div>)}</div> : propios && <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4"><p className="text-sm text-emerald-900">Tu coevaluación consolidada: <strong>{Number(propios.total_coevaluacion).toFixed(2)}%</strong></p><p className="text-sm text-emerald-900 mt-1">Nota final individual: <strong>{propios.nota_final === null ? 'Pendiente de calificación docente' : Number(propios.nota_final).toFixed(2)}</strong></p></div>}</section>;
  };

  const renderCard = (activity, assignment) => {
    const delivery = assignment.entrega;
    const selectedCriteria = (activity.criterios_snapshot || []).filter((item) => item.seleccionado);
    const pending = delivery?.coevaluaciones?.filter((item) => item.id_evaluador === userId && item.estado !== 'ENVIADA') || [];
    const peerCriteria = activity.rubrica_coevaluacion?.criterios?.filter((item) => item.es_hoja !== false && !item.hijos?.length).map((item) => ({ ...item, id: item.id_criterio ?? item.id })) || [];
    return <article key={assignment.id_actividad_proyecto} className="bg-white rounded-[1.5rem] border border-neutral-200/80 shadow-sm overflow-hidden"><div className="p-5 sm:p-7"><div className="flex flex-col lg:flex-row justify-between gap-5"><div><div className="flex flex-wrap items-center gap-2 mb-3"><Badge status={delivery?.estado === 'ENTREGADA' ? 'activo' : 'en_revision'}>{delivery?.estado === 'ENTREGADA' ? 'Entregada' : 'Pendiente'}</Badge><span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-500"><Users className="w-3.5 h-3.5" />{assignment.proyecto.titulo}</span></div><h2 className="text-2xl font-black text-[#201b16]">{activity.nombre}</h2><p className="text-sm text-neutral-600 mt-2 max-w-2xl">{activity.descripcion}</p></div><div className="rounded-2xl bg-[#faf8f2] border border-[#eee5d1] px-4 py-3"><p className="text-[10px] uppercase tracking-wider font-bold text-[#a77f2d]">Fecha límite</p><p className="flex items-center gap-2 text-sm font-extrabold mt-1"><Clock className="w-4 h-4 text-[#c8102e]" />{formatDate(activity.fecha_limite)}</p></div></div>{!esDocente && delivery && renderDelivery(delivery)}{!esDocente && pending.length > 0 && <section className="mt-5 pt-5 border-t border-neutral-200"><div className="flex items-center gap-2 mb-4"><Users className="w-4 h-4 text-[#c8102e]" /><h3 className="font-extrabold">Coevaluación anónima</h3></div>{pending.map((review) => <div key={review.id_coevaluacion} className="rounded-2xl bg-[#f8f7f4] border border-neutral-200 p-4 space-y-3"><p className="text-sm font-bold">Evalúa a {review.evaluado.nombre}</p><div className="grid grid-cols-2 sm:grid-cols-5 gap-2">{peerCriteria.map((criterion) => <label key={criterion.id} className="text-[11px] font-bold text-neutral-600">{criterion.nombre}<select value={ratings[`${delivery.id_entrega}:${review.id_evaluado}:${criterion.id}`] || ''} onChange={(e) => setRatings({ ...ratings, [`${delivery.id_entrega}:${review.id_evaluado}:${criterion.id}`]: e.target.value })} className="field mt-1 p-2"><option value="">-</option>{coevalScale.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>)}</div><Button type="button" variant="secondary" onClick={() => enviarCoevaluacion(delivery.id_entrega, review.id_evaluado, peerCriteria)}>Enviar evaluación</Button></div>)}</section>}{esDocente && delivery && <section className="mt-5 pt-5 border-t border-neutral-200"><div className="flex justify-between mb-3"><div><p className="text-sm font-extrabold">Calificación docente</p><p className="text-xs text-neutral-500">Solo hojas seleccionadas: {selectedCriteria.length}</p></div><span className="text-xs font-bold text-[#a77f2d]">{delivery.evaluacion ? `Nota base: ${delivery.evaluacion.nota_final}` : 'Pendiente'}</span></div><div className="grid sm:grid-cols-2 gap-2">{selectedCriteria.map((criterion) => <label key={criterion.id_criterio} className="text-xs font-bold text-neutral-600">{criterion.nombre}<input type="number" min="0" max="5" step="0.1" value={teacherGrades[`${delivery.id_entrega}:${criterion.id_criterio}`] || ''} onChange={(e) => setTeacherGrades({ ...teacherGrades, [`${delivery.id_entrega}:${criterion.id_criterio}`]: e.target.value })} className="field mt-1" /></label>)}</div><Button type="button" variant="primary" className="mt-3" onClick={() => guardarEvaluacion(delivery.id_entrega, selectedCriteria)}>Guardar calificación</Button></section>}{!esDocente && renderResults(delivery)}</div></article>;
  };

  return <div className="min-h-full bg-[#f6f7f8] p-5 sm:p-8 lg:p-10"><div className="max-w-6xl mx-auto space-y-7"><header className="flex flex-col sm:flex-row sm:items-end justify-between gap-5"><div><div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-extrabold text-[#c8102e]"><ClipboardCheck className="w-4 h-4" /> Trabajo académico</div><h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[#201b16] mt-2">Entregables</h1><p className="text-sm text-neutral-500 mt-2">Actividades publicadas para grupos y evaluación entre pares.</p></div><div className="flex items-center gap-3 text-sm text-neutral-500"><div className="w-11 h-11 rounded-2xl bg-[#f4e8c8] text-[#a77f2d] flex items-center justify-center"><CalendarDays /></div><div><p className="font-bold text-[#201b16]">{actividades.length} actividades</p><p>{esDocente ? 'Publica a tus grupos asignados' : 'Pendientes de tu proyecto'}</p></div></div></header>{esDocente && renderCreation()}<div className="space-y-5">{actividades.flatMap((activity) => activity.proyectos.map((assignment) => renderCard(activity, assignment)))}</div>{!actividades.length && <div className="text-center py-16 bg-white border border-dashed border-neutral-300 rounded-[1.5rem]"><ClipboardCheck className="w-10 h-10 mx-auto text-neutral-300" /><p className="mt-3 font-bold text-neutral-600">Todavía no hay actividades</p></div>}</div></div>;
};
