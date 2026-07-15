import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();
    const orderId = formData.get('orderId');
    const psd = formData.get('psd');
    const preview = formData.get('preview');
    const layers = formData.get('layers');
    const psdMeta = formData.get('psdMeta');

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid order ID' },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (!psd || typeof psd === 'string') {
      return NextResponse.json(
        { success: false, message: 'PSD file is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const arrayBuffer = await psd.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!buffer.length) {
      return NextResponse.json(
        { success: false, message: 'Uploaded PSD file is empty' },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (!preview || typeof preview !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Generated PSD preview is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    let parsedLayers = [];
    let parsedPsdMeta = {};

    try {
      parsedLayers = layers ? JSON.parse(layers) : [];
      parsedPsdMeta = psdMeta ? JSON.parse(psdMeta) : {};
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid PSD metadata payload' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const mimeType = psd.type || 'application/octet-stream';
    const base64Psd = `data:${mimeType};base64,${buffer.toString('base64')}`;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          'order.thumbnail': preview,
          'canvas_info.psdPreview': preview,
          'canvas_info.psdLayers': parsedLayers,
          'canvas_info.uploadedPsd': {
            ...(parsedPsdMeta || {}),
            data: base64Psd,
            uploadedAt: new Date().toISOString(),
          },
        },
      },
      { new: true }
    ).lean();

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Order PSD updated successfully',
        order: updatedOrder,
        thumbnail: updatedOrder.order?.thumbnail || '',
        psdPreview: updatedOrder.canvas_info?.psdPreview || '',
        psdLayers: updatedOrder.canvas_info?.psdLayers || [],
        uploadedPsd: updatedOrder.canvas_info?.uploadedPsd || null,
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to update order PSD',
      },
      { status: 500, headers: corsHeaders() }
    );
  }
}
