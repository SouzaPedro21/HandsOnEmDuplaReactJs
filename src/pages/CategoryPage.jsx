import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import categoryService from "@services/categoryService"; // Certifique-se de ter esse service implementado
import { Link } from 'react-router-dom';

const initialCategory = {
  category_name: "",
};

const CategoryPage = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const CATEGORIES_PER_PAGE = 12;

  // Buscar categorias existentes
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['categories', currentPage],
    queryFn: () => categoryService.getCategoriesByPage(currentPage, CATEGORIES_PER_PAGE),
    keepPreviousData: true,
  });

  const [category, setCategory] = useState(initialCategory);
  const [errors, setErrors] = useState({});

  const createCategoryMutation = useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      toast.success("Categoria criada com sucesso!", {
        duration: 2000,
        icon: "✅",
      });
      setCategory(initialCategory);
      queryClient.invalidateQueries(["categories"]);
    },
    onError: (error) => {
      toast.error(`Erro ao criar categoria: ${error.message}`, {
        duration: 3000,
        icon: "❌",
      });
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!category.category_name.trim()) {
      newErrors.category_name = "O nome da categoria é obrigatório";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      createCategoryMutation.mutate(category);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
        <p className="mt-2">Carregando categorias...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        Erro ao carregar categorias: {error.message}
      </div>
    );
  }

  const { categories, totalPages } = data;

  return (
    <div className="container">
      <h1 className="mb-4">Categorias</h1>
      
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {categories.map((category) => (
          <div key={category.id} className="col">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{category.category_name}</h5>
                <Link to={`/products?category=${category.id}`} className="btn btn-primary">
                  Ver Produtos
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default CategoryPage;