"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { App, Table, Button, Input, Space, Typography, Modal, Form, InputNumber } from "antd";
import type { TableProps, TablePaginationConfig } from "antd";
import { Product } from "@/types";
import debounce from "lodash/debounce";

const { Title } = Typography;
const { Search } = Input;

function ProductsPageContent() {
    const { notification } = App.useApp();

    const [products, setProducts] = useState<Product[]>([]); // Menyimpan array data produk untuk tabel.
    const [loading, setLoading] = useState(true); // Melacak status pemanggilan API. Awalnya true agar spinner muncul saat pertama kali halaman dimuat.
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    }); // Menyimpan info halaman saat ini, ukuran halaman, dan total item.

    const [isModalOpen, setIsModalOpen] = useState(false); // Mengontrol apakah modal (untuk create/edit) sedang ditampilkan atau tidak.
    const [editingProduct, setEditingProduct] = useState<Product | null>(null); // Menyimpan data produk yang sedang diedit. Jika null, berarti modal dalam mode "create". Jika berisi objek produk, berarti mode "edit".
    const [form] = Form.useForm();

    // Mengambil data produk dari API Proxy (/api/products).
    const fetchProducts = useCallback( // Mencegah fungsi ini dibuat ulang di setiap render.
        async (page: number, pageSize: number, searchTerm: string = "") => {
            try {
                setLoading(true); // Menampilkan spinner sebelum panggilan API dimulai.
                const params = { page, limit: pageSize, search: searchTerm };
                const response = await axios.get("/api/products", { params }); // Melakukan panggilan API dengan parameter page, limit, dan search
                const { data, pagination: paginationData } = response.data;
                setProducts(data); // Memperbarui state dengan data baru yang diterima dari API.
                if (paginationData) {
                    setPagination((prev) => ({
                        ...prev,
                        current: paginationData.page,
                        pageSize: paginationData.limit,
                        total: paginationData.total,
                    }));
                }
            } catch (error) {
                console.error("Gagal mengambil data produk:", error);
                notification.error({
                    message: "Gagal Memuat Data",
                    description: "Tidak dapat mengambil daftar produk dari server.",
                }); // Blok ini akan berjalan jika panggilan API gagal, menampilkan notifikasi error kepada pengguna.
            } finally {
                setLoading(false); // Blok ini akan selalu berjalan di akhir (baik sukses maupun gagal) untuk menyembunyikan spinner.
            }
        },
        [notification]
    );

    const debouncedSearch = useMemo( // Memastikan fungsi debounce ini tidak dibuat ulang kecuali dependensinya (fetchProducts atau pageSize) berubah.
        () =>
            debounce((searchTerm: string) => {
                fetchProducts(1, pagination.pageSize, searchTerm); // Fungsi ini hanya akan dieksekusi 300ms setelah pengguna berhenti mengetik. Ia akan selalu mencari dari halaman 1.
            }, 300),
        [fetchProducts, pagination.pageSize]
    );

    useEffect(() => {
        fetchProducts(1, 10);
        return () => {
            debouncedSearch.cancel();
        };
        // eslint-disable-next-line
    }, []);

    const handleTableChange = (newPagination: TablePaginationConfig) => {
        fetchProducts(newPagination.current!, newPagination.pageSize!); // Dipanggil saat pengguna mengganti halaman di pagination.
    };

    const showCreateModal = () => {
        setEditingProduct(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const showEditModal = (record: Product) => {
        setEditingProduct(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleCancelModal = () => {
        setIsModalOpen(false);
    };

    const handleFormSubmit = async (values: Product) => {
        const isEditing = !!editingProduct;
        const apiCall = isEditing ? axios.put("/api/product", { ...values, product_id: editingProduct!.product_id }) : axios.post("/api/product", values);
        try {
            await apiCall;
            setIsModalOpen(false);
            notification.success({ message: "Sukses", description: `Produk berhasil ${isEditing ? "diperbarui" : "dibuat"}.` });
            fetchProducts(pagination.current, pagination.pageSize);
        } catch (error) {
            console.error("Gagal menyimpan produk:", error);
            notification.error({ message: "Gagal Menyimpan", description: "Terjadi kesalahan saat menyimpan produk." });
        }
    };

    const columns: TableProps<Product>["columns"] = [
        { title: "Product Title", dataIndex: "product_title", key: "product_title" },
        { title: "Price", dataIndex: "product_price", key: "product_price", render: (price: number) => `Rp ${price.toLocaleString("id-ID")}` },
        { title: "Category", dataIndex: "product_category", key: "product_category" },
        { title: "Description", dataIndex: "product_description", key: "product_description", render: (text: string) => (text && text.length > 50 ? `${text.substring(0, 50)}...` : text) },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" onClick={() => showEditModal(record)}>
                        Edit
                    </Button>
                    <Button type="link" danger>
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: "24px" }}>
            <Title level={2}>Product Management</Title>
            <Space style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
                <Search placeholder="Find Product..." onChange={(e) => debouncedSearch(e.target.value)} style={{ width: 400 }} allowClear />
                <Button type="primary" onClick={showCreateModal}>
                    Create Product
                </Button>
            </Space>

            <Table columns={columns} dataSource={products} rowKey="product_id" loading={loading} pagination={pagination} onChange={handleTableChange} />

            <Modal title={editingProduct ? "Edit Product" : "Create Product"} open={isModalOpen} onCancel={handleCancelModal} onOk={() => form.submit()} destroyOnHidden>
                <Form form={form} layout="vertical" name="product_form" onFinish={handleFormSubmit}>
                    <Form.Item name="product_title" label="Product Title" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="product_price" label="Price" rules={[{ required: true, type: "number" }]}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item name="product_description" label="Description">
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item name="product_category" label="Category">
                        <Input />
                    </Form.Item>
                    <Form.Item name="product_image" label="Image URL">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default function ProductsPage() {
    return <ProductsPageContent />;
}
