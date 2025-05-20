import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import categoryService from "@services/categoryService"; // Certifique-se de ter esse service implementado

const initialCategory = {
  category_name: "",
};

const CategoryPage = () => {
  const queryClient = useQueryClient();

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

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card">
          <div className="card-header text-bg-dark">
            <h2 className="mb-0">Cadastrar Nova Categoria</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="category_name" className="form-label">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.category_name ? "is-invalid" : ""}`}
                  id="category_name"
                  name="category_name"
                  value={category.category_name}
                  onChange={handleChange}
                />
                {errors.category_name && (
                  <div className="invalid-feedback">{errors.category_name}</div>
                )}
              </div>
              <div className="d-flex">
                <button
                  type="submit"
                  className="btn btn-success me-2"
                  disabled={createCategoryMutation.isLoading}
                >
                  {createCategoryMutation.isLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Salvando...
                    </>
                  ) : (
                    "Cadastrar Categoria"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;