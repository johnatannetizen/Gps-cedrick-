import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:battery_plus/battery_plus.dart';

/// Servicio CEDRICK GPS TRACKER para convertir el smartphone en dispositivo emisor
/// Compatible con protocolo OsmAnd / Traccar Client Port 5055
class CedrickTrackerService {
  static final CedrickTrackerService _instance = CedrickTrackerService._internal();
  factory CedrickTrackerService() => _instance;
  CedrickTrackerService._internal();

  bool _isTracking = false;
  StreamSubscription<Position>? _positionStream;
  final Battery _battery = Battery();
  
  // Configuración
  String _serverUrl = "https://app.cedrickgps.com:5055";
  String _deviceId = "CEDRICK-MOBILE-01";
  int _intervalSeconds = 10;
  double _distanceFilterMeters = 5.0;

  bool get isTracking => _isTracking;

  Future<bool> requestPermissions() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return false;
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return false;
    }

    if (permission == LocationPermission.deniedForever) {
      return false;
    }

    return true;
  }

  Future<void> startTracking({
    required String serverUrl,
    required String deviceId,
    int intervalSeconds = 10,
  }) async {
    if (_isTracking) return;

    final hasPermission = await requestPermissions();
    if (!hasPermission) throw Exception("Permisos de ubicación denegados.");

    _serverUrl = serverUrl;
    _deviceId = deviceId;
    _intervalSeconds = intervalSeconds;
    _isTracking = true;

    final locationSettings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: _distanceFilterMeters.toInt(),
    );

    _positionStream = Geolocator.getPositionStream(locationSettings: locationSettings).listen((Position position) async {
      await _sendPosition(position);
    });
  }

  Future<void> _sendPosition(Position pos) async {
    try {
      final batteryLevel = await _battery.batteryLevel;
      final uri = Uri.parse(_serverUrl).replace(
        path: "/",
        queryParameters: {
          'id': _deviceId,
          'lat': pos.latitude.toString(),
          'lon': pos.longitude.toString(),
          'timestamp': (pos.timestamp.millisecondsSinceEpoch ~/ 1000).toString(),
          'altitude': pos.altitude.toString(),
          'speed': (pos.speed * 1.94384).toStringAsFixed(1), // Nudos para Traccar
          'bearing': pos.heading.toString(),
          'batt': batteryLevel.toString(),
        },
      );

      final response = await http.get(uri).timeout(const Duration(seconds: 8));
      if (response.statusCode != 200) {
        _queueOfflinePosition(pos, batteryLevel);
      }
    } catch (e) {
      // Almacenar en cola offline si no hay conexión
      _queueOfflinePosition(pos, 0);
    }
  }

  Future<void> _queueOfflinePosition(Position pos, int battery) async {
    final prefs = await SharedPreferences.getInstance();
    List<String> queue = prefs.getStringList('cedrick_offline_queue') ?? [];
    queue.add(jsonEncode({
      'lat': pos.latitude,
      'lon': pos.longitude,
      'time': DateTime.now().toIso8601String(),
      'batt': battery,
    }));
    // Limitar cola a 1000 posiciones
    if (queue.length > 1000) queue.removeAt(0);
    await prefs.setStringList('cedrick_offline_queue', queue);
  }

  Future<void> stopTracking() async {
    await _positionStream?.cancel();
    _positionStream = null;
    _isTracking = false;
  }
}
