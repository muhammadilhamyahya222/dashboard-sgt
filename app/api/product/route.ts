import { NextResponse, NextRequest } from "next/server";
import axios from "axios";

const EXTERNAL_API_URL = "http://localhost:8001/api/web/v1/product";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get("product_id");

        if (!productId) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        const response = await axios.get(`${EXTERNAL_API_URL}?product_id=${productId}`);

        return NextResponse.json(response.data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch single product" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const response = await axios.post(EXTERNAL_API_URL, body);

        return NextResponse.json(response.data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const response = await axios.put(EXTERNAL_API_URL, body);

        return NextResponse.json(response.data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}
