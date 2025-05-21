import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import categoryService from "@services/categoryService";
import { toast } from "react-hot-toast";

const AdminCreateCategoryPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);

  // Se for edição, busca a categoria pelo id
  useEffect(() => {
    const fetchCategory = async () => {
      if (!id) return;
      setLoading(true);
      const { categories } = await categoryService.getCategoriesByPage(1, 1000);
      const cat = categories.find((c) => String(c.id) === String(id));
      if (cat) setCategoryName(cat.category_name);
      setLoading(false);
    };
    fetchCategory();
  }, [id]);

  const createCategoryMutation = useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      toast.success("Categoria criada com sucesso!");
      navigate("/admin/categories");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar categoria");
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, category }) => categoryService.updateCategory(id, category),
    onSuccess: () => {
      toast.success("Categoria atualizada com sucesso!");
      navigate("/admin/categories");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar categoria");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error("O nome da categoria é obrigatório");
      return;
    }
    if (id) {
      // Edição
      updateCategoryMutation.mutate({ id, category: { category_name: categoryName.trim() } });
    } else {
      // Criação
      createCategoryMutation.mutate({ category_name: categoryName.trim() });
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h2 className="mb-0">{id ? "Alterar Categoria" : "Nova Categoria"}</h2>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="categoryName" className="form-label">
                    Nome da Categoria
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="categoryName"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Digite o nome da categoria"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate("/admin/categories")}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={createCategoryMutation.isLoading || updateCategoryMutation.isLoading || loading}
                  >
                    {(createCategoryMutation.isLoading || updateCategoryMutation.isLoading || loading) ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Salvando...
                      </>
                    ) : (
                      id ? "Salvar Alterações" : "Criar Categoria"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateCategoryPage;