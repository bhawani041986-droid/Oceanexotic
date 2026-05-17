/**
 * OceanExotic Global Sovereign Database Connector
 * Utilizes the Maritime PHP Bridge to execute MySQL queries.
 */

import { BRIDGE_URL } from '@/config/api';

export async function query(sql: string, params: any[] = [], type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' = 'SELECT') {
  try {
    const response = await fetch(BRIDGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: sql,
        params: params,
        type: type
      }),
      cache: 'no-store'
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Maritime Registry Failure");
    }

    return result;
  } catch (error) {
    console.error("❌ Sovereign Database Error:", error);
    throw error;
  }
}

// Helper for single row fetch
export async function queryOne(sql: string, params: any[] = []) {
  const result = await query(sql, params, 'SELECT');
  return result.data && result.data.length > 0 ? result.data[0] : null;
}
