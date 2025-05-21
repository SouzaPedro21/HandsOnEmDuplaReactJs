// src/pages/admin/AdminCreateProductPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import productService from '@services/productService';
import categoryService from '@services/categoryService';

const AdminCreateProductPage = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const queryClient = useQueryClient();
    const productToEdit = state?.product;
    const fileRef = useRef(null);
    const [product, setProduct] = useState({
        title: '',
        description: '',
        price: '',
        image_file: null,
        image_preview: '',
        image_url: '',
        category_id: ''
    });

    const [errors, setErrors] = useState({});

    // Buscar categorias
    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: () => categoryService.getCategoriesByPage(1, 1000),
    });

    // Se for um produto para editar, inicializa o estado com os dados do produto
    useEffect(() => {
        if (productToEdit) {
            setProduct({
                title: productToEdit.title,
                description: productToEdit.description,
                price: productToEdit.price,
                image_url: productToEdit.image_url,
                category_id: productToEdit.category_id || ''
            });
        }
    }, [productToEdit]);

    // Adicionar log quando o estado do produto mudar
    useEffect(() => {
        console.log('Product state updated:', product);
    }, [product]);

    const createProductMutation = useMutation({
        mutationFn: productService.createProduct,
        onSuccess: () => {
            toast.success('Produto criado com sucesso!', { icon: '✅' });
            navigate('/admin/products');
        },
        onError: (error) => {
            toast.error(`Erro ao criar produto: ${error.message}`, { icon: '❌' });
        }
    });

    const updateProductMutation = useMutation({
        mutationFn: ({ id, ...fields }) => productService.updateProduct(id, fields),
        onSuccess: () => {
            queryClient.invalidateQueries(['products']).then(() => {
                toast.success('Produto atualizado com sucesso!', { icon: '✅' });
                navigate('/admin/products');
            }).catch((error) => {
                toast.error(`Erro ao atualizar lista de produtos: ${error.message}`, { icon: '❌' });
            });
        },
        onError: (error) => {
            toast.error(`Erro ao atualizar produto: ${error.message}`, { icon: '❌' });
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileSelect = e => {
        const file = e.target.files?.[0];
        if (!file) return;
        setProduct(p => ({ ...p, image_file: file, image_preview: URL.createObjectURL(file), image_url: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        console.log('Validating form with values:', product);

        if (!product.title.trim()) {
            newErrors.title = 'O título é obrigatório';
            console.log('Title validation failed');
        }
        if (!product.description.trim()) {
            newErrors.description = 'A descrição é obrigatória';
            console.log('Description validation failed');
        }
        if (!product.price) {
            newErrors.price = 'O preço é obrigatório';
            console.log('Price validation failed');
        } else if (isNaN(Number(product.price)) || Number(product.price) <= 0) {
            newErrors.price = 'O preço deve ser um número positivo';
            console.log('Price format validation failed');
        }
        if (!product.category_id) {
            newErrors.category_id = 'Selecione uma categoria';
            console.log('Category validation failed');
        }

        console.log('Validation errors:', newErrors);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        console.log('Form submitted');
        
        if (!validateForm()) {
            console.log('Form validation failed');
            return;
        }

        try {
            console.log('Starting product creation/update');
            let path = product.image_url;
            if (product.image_file) {
                console.log('Uploading image...');
                path = await productService.uploadImage(product.image_file);
            }

            const payload = { 
                title: product.title,
                description: product.description,
                price: parseFloat(product.price),
                image_url: path,
                category_id: product.category_id
            };

            console.log('Payload sendo enviado:', payload);

            if (productToEdit) {
                console.log('Updating existing product...');
                await updateProductMutation.mutateAsync({ id: productToEdit.id, ...payload });
            } else {
                console.log('Creating new product...');
                await createProductMutation.mutateAsync(payload);
            }
        } catch (err) {
            console.error('Erro detalhado:', err);
            toast.error(`Erro ao salvar: ${err.message}`, { icon: '❌' });
        }
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-8">
                <div className="card">
                    <div className="card-header text-bg-light">
                        <h2 className="mb-0">{productToEdit ? 'Alterar Produto' : 'Novo Produto'}</h2>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="title" className="form-label">Título</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                    id="title"
                                    name="title"
                                    value={product.title}
                                    onChange={handleChange} autoFocus />
                                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="description" className="form-label">Descrição</label>
                                <textarea
                                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                                    id="description"
                                    name="description"
                                    rows="3"
                                    value={product.description}
                                    onChange={handleChange}></textarea>
                                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
                            </div>
                            <div className="mb-3">
                                <label htmlFor="price" className="form-label">Preço (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                                    id="price"
                                    name="price"
                                    value={product.price}
                                    onChange={handleChange} />
                                {errors.price && <div className="invalid-feedback">{errors.price}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Categoria</label>
                                <div className={`border rounded p-3 ${errors.category_id ? 'is-invalid' : ''}`} style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {categoriesData?.categories.map(category => (
                                        <div key={category.id} className="form-check mb-2">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="category_id"
                                                id={`category_${category.id}`}
                                                value={category.id}
                                                checked={product.category_id === category.id.toString()}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label" htmlFor={`category_${category.id}`}>
                                                {category.category_name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {errors.category_id && <div className="invalid-feedback">{errors.category_id}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Foto do produto</label><br />
                                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => fileRef.current?.click()}>
                                    Selecionar arquivo
                                </button>
                                <input type="file" accept="image/*" className="d-none" ref={fileRef} onChange={handleFileSelect} />
                            </div>

                            {product.image_preview || product.image_url ? (
                                <div className="mb-3 text-start">
                                    <img
                                        src={product.image_preview || product.image_url}
                                        alt="Pré-visualização"
                                        className="img-thumbnail"
                                        style={{ maxHeight: 200 }}/>
                                </div>
                            ) : null}

                            <div className="d-flex">
                                <button
                                    type="submit"
                                    className="btn btn-success me-2"
                                    disabled={createProductMutation.isPending || updateProductMutation.isPending}
                                    onClick={handleSubmit}>
                                    {createProductMutation.isPending || updateProductMutation.isPending ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Salvando...
                                        </>
                                    ) : 'Salvar Produto'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => navigate('/admin/products')}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCreateProductPage;