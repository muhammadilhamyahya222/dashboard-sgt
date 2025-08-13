import { NextResponse } from "next/server";
import axios from "axios";

const EXTERNAL_API_URL = "http://localhost:8001/api/web/v1/products";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const response = await axios.get(EXTERNAL_API_URL, {
            params: searchParams,
        });

        return NextResponse.json(response.data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}
