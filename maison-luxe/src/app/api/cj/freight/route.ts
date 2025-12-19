import { NextRequest, NextResponse } from 'next/server';
import { cjService } from '@/lib/cjdropshipping';
import { successResponse, sendErrorResponse } from '@/lib/errors';

// POST - Calculer le coût de livraison CJ pour une liste de VIDs
export async function POST(request: NextRequest) {
  try {
    const { vids, country = 'FR', quantity = 1 } = await request.json();

    if (!vids || !Array.isArray(vids) || vids.length === 0) {
      return sendErrorResponse('MISSING_REQUIRED_FIELD', 'vids required');
    }

    const products = vids.map((vid: string) => ({ vid, quantity }));

    const freightDataRaw = (await cjService.calculateFreight({
      startCountryCode: 'CN',
      endCountryCode: country,
      products,
    })) as unknown;

    if (!Array.isArray(freightDataRaw) || freightDataRaw.length === 0) {
      return NextResponse.json(successResponse({ shippingOptions: [], defaultShipping: null }));
    }

    const freightData = freightDataRaw as Array<Record<string, any>>;

    const sortedByPrice = [...freightData].sort((a, b) => (parseFloat(String(a.logisticPrice || 0)) - parseFloat(String(b.logisticPrice || 0))));
    const sortedBySpeed = [...freightData].sort((a, b) => {
      const aDays = parseInt((a.logisticAging || '').split('-')[1]) || 999;
      const bDays = parseInt((b.logisticAging || '').split('-')[1]) || 999;
      return aDays - bDays;
    });

    const cheapest = sortedByPrice[0];
    const express = sortedBySpeed[0] && sortedBySpeed[0] !== cheapest ? sortedBySpeed[0] : sortedByPrice[Math.min(1, sortedByPrice.length - 1)];

    const options = [
      {
        id: 'standard',
        name: 'Standard',
        logisticName: cheapest.logisticName,
        price: cheapest.logisticPrice,
        deliveryTime: cheapest.logisticAging,
        totalFee: cheapest.totalPostageFee || cheapest.logisticPrice,
      },
    ];
    if (express) {
      options.push({
        id: 'express',
        name: 'Express',
        logisticName: express.logisticName,
        price: express.logisticPrice,
        deliveryTime: express.logisticAging,
        totalFee: express.totalPostageFee || express.logisticPrice,
      });
    }

    return NextResponse.json(successResponse({ shippingOptions: options, defaultShipping: options[0] }));
  } catch (error: any) {
    // Gérer la rate limit avec une réponse douce
    if (error.message?.includes('Too Many Requests') || error.message?.includes('QPS limit')) {
      return NextResponse.json(successResponse({ rateLimited: true, shippingOptions: [], defaultShipping: null, message: 'Rate limit' }));
    }
    return sendErrorResponse('INTERNALerror', error.message || 'Failed to calculate freight');
  }
}
