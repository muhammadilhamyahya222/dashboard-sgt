// Properti Product
export interface Product {
    product_id: string;
    product_title: string;
    product_price: number;
    product_description?: string;
    product_image?: string;
    product_category?: string;
    created_timestamp: string;
    updated_timestamp: string;
}

// Parameter yang bisa digunakan saat mengambil daftar produk
export interface ProductListParams {
    page: number;
    limit: number;
    offset: number;
    search?: string;
}
