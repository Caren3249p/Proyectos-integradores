
/// Tarea del backlog. El backend reenvía el objeto "work item" de Plane
/// casi sin transformar, así que los campos son tolerantes a null: Plane
/// puede devolver el estado como texto plano o como { state_detail: {...} }.
class TareaBacklog {
  final String id;
  final String titulo;
  final String estado; // por_hacer | en_progreso | hecho

  const TareaBacklog({
    required this.id,
    required this.titulo,
    required this.estado,
  });

  factory TareaBacklog.fromJson(Map<String, dynamic> json) {
    final estadoBruto = (json['state_detail'] is Map
            ? (json['state_detail'] as Map)['name']
            : json['state']) ??
        'por_hacer';
    return TareaBacklog(
      id: '${json['id']}',
      titulo: (json['name'] ?? json['titulo'] ?? 'Sin título') as String,
      estado: _normalizar('$estadoBruto'),
    );
  }

  static String _normalizar(String valor) {
    final v = valor.toLowerCase().trim();
    if (v.contains('progres')) return 'en_progreso';
    if (v.contains('hecho') || v.contains('done') || v.contains('complet')) {
      return 'hecho';
    }
    return 'por_hacer';
  }
}