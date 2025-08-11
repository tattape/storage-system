import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Simple health check
        const healthData = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '1.0.0'
        };

        return NextResponse.json(healthData, { status: 200 });
    } catch {
        return NextResponse.json(
            { 
                status: 'error', 
                message: 'Health check failed',
                timestamp: new Date().toISOString()
            }, 
            { status: 500 }
        );
    }
}
