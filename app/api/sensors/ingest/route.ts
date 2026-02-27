import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for sensor readings (would be replaced with database)
const sensorReadings: Map<number, any[]> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plantId, temperature, humidity, soilMoisture, lightIntensity, acousticData } = body;

    // Validate required fields
    if (!plantId || temperature === undefined || humidity === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: plantId, temperature, humidity' },
        { status: 400 }
      );
    }

    const reading = {
      plantId,
      temperature,
      humidity,
      soilMoisture: soilMoisture ?? null,
      lightIntensity: lightIntensity ?? null,
      acousticData: acousticData ?? null,
      timestamp: new Date().toISOString(),
    };

    // Store reading
    if (!sensorReadings.has(plantId)) {
      sensorReadings.set(plantId, []);
    }
    
    const readings = sensorReadings.get(plantId)!;
    readings.push(reading);
    
    // Keep only last 1000 readings per plant to avoid memory overflow
    if (readings.length > 1000) {
      readings.shift();
    }

    console.log('[v0] Sensor reading ingested:', reading);

    return NextResponse.json(
      {
        success: true,
        message: 'Sensor data ingested successfully',
        reading,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Sensor ingestion error:', error);
    return NextResponse.json(
      { error: 'Failed to ingest sensor data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const plantId = searchParams.get('plantId');
    const limit = parseInt(searchParams.get('limit') ?? '100');

    if (!plantId) {
      return NextResponse.json(
        { error: 'plantId is required' },
        { status: 400 }
      );
    }

    const plantIdNum = parseInt(plantId);
    const readings = sensorReadings.get(plantIdNum) ?? [];
    const recentReadings = readings.slice(-limit);

    return NextResponse.json(
      {
        success: true,
        plantId: plantIdNum,
        readingCount: recentReadings.length,
        readings: recentReadings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Failed to fetch sensor readings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sensor data' },
      { status: 500 }
    );
  }
}
