export interface Device {
  id: number;
  name: string;
  uniqueId: string;
  status: 'online' | 'offline' | 'unknown';
  disabled: boolean;
  lastUpdate: string;
  positionId: number;
  groupId: number;
  phone: string;
  model: string;
  contact: string;
  category: 'car' | 'truck' | 'motorcycle' | 'phone' | 'van';
  attributes: {
    ignition: boolean;
    batteryLevel: number;
    speedLimit?: number;
    fuelCutoff?: boolean;
    distance?: number;
    totalDistance?: number;
    motion?: boolean;
    plateNumber?: string;
  };
}

export interface Position {
  id: number;
  deviceId: number;
  protocol: string;
  serverTime: string;
  deviceTime: string;
  fixTime: string;
  valid: boolean;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  course: number;
  address: string;
  accuracy: number;
  attributes: {
    batteryLevel: number;
    ignition: boolean;
    motion: boolean;
    odometer: number;
    satellites?: number;
  };
}

export interface Geofence {
  id: number;
  name: string;
  description: string;
  area: string;
  calendarId: number;
  color: string;
  speedLimit?: number;
  attributes: {
    type?: 'circle' | 'polygon';
    radius?: number;
    centerLat?: number;
    centerLon?: number;
    alertOnEnter?: boolean;
    alertOnExit?: boolean;
  };
}

export interface Group {
  id: number;
  name: string;
  description: string;
  type: 'fleet' | 'family' | 'security';
  admin: string;
  membersCount: number;
  sharingConsentLaw1581: boolean;
}

export interface NotificationAlert {
  id: number;
  type: 'deviceOverspeed' | 'geofenceEnter' | 'geofenceExit' | 'alarm' | 'ignitionOn' | 'ignitionOff';
  deviceId: number;
  deviceName: string;
  eventTime: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  read: boolean;
}

export interface TripReport {
  id: number;
  deviceId: number;
  deviceName: string;
  startTime: string;
  endTime: string;
  startAddress: string;
  endAddress: string;
  distance: number;
  averageSpeed: number;
  maxSpeed: number;
  duration: string;
}

export interface TestResult {
  name: string;
  passed: boolean;
  latencyMs: number;
}
