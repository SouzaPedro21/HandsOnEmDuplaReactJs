import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import categoryService from "@services/categoryService";
import { toast } from "react-hot-toast";

const LIMIT = 10;

const AdminCategoriesPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["categories", page],
    queryFn: async () => {
      console.log('Iniciando busca de categorias - página:', page);
      try {
        const result = await categoryService.getCategoriesByPage(page, LIMIT);
        console.log('Resultado da busca:', result);
        return result;
      } catch (err) {
        console.error('Erro na busca de categorias:', err);
        throw err;
      }
    },
    keepPreviousData: true,
  });

  console.log('Estado completo da query:', {
    data,
    isLoading,
    isError,
    error,
    hasData: !!data,
    categories: data?.categories,
    totalPages: data?.totalPages
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => {
      toast.success("Categoria excluída com sucesso!");
      queryClient.invalidateQueries(["categories"]);
    },
    onError: (error) => {
      console.error('Erro ao excluir categoria:', error);
      toast.error(`Erro ao excluir categoria: ${error.message}`);
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Deseja realmente excluir esta categoria?")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  return (
    <div className="container-fluid px-2 px-md-4">
      <div className="row">
        <div className="col-12">
          <h2 className="text-center mb-3">Categorias</h2>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-12 d-flex justify-content-center">
          <a href="/admin/categories/new" className="btn btn-success">
            <i className="bi bi-plus-lg"></i> Nova Categoria
          </a>
        </div>
      </div>
      {isLoading && (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-2">Carregando categorias...</p>
        </div>
      )}
      {isError && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Erro ao carregar categorias: {error?.message}
        </div>
      )}
      {!isLoading && !isError && data && (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>Nome</th>
                <th className="text-end" style={{ minWidth: 140 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.categories?.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center">
                    Nenhuma categoria encontrada.
                  </td>
                </tr>
              )}
              {data.categories?.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.category_name}</td>
                  <td className="text-end">
                    <div className="d-inline-flex flex-column flex-sm-row gap-2">
                      <a
                        href={`/admin/categories/edit/${cat.id}`}
                        className="btn btn-sm btn-primary"
                      >
                        <i className="bi bi-pencil"></i> <span className="d-none d-sm-inline">Editar</span>
                      </a>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(cat.id)}
                        disabled={deleteCategoryMutation.isLoading}
                      >
                        <i className="bi bi-trash"></i> <span className="d-none d-sm-inline">Excluir</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Paginação */}
      {!isLoading && !isError && data && (
        <nav>
          <ul className="pagination justify-content-center flex-wrap">
            <li className={`page-item${page === 1 ? " disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </button>
            </li>
            {Array.from({ length: data.totalPages || 1 }, (_, i) => (
              <li
                key={i + 1}
                className={`page-item${page === i + 1 ? " active" : ""}`}
              >
                <button className="page-link" onClick={() => setPage(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
            <li
              className={`page-item${page === data.totalPages ? " disabled" : ""}`}
            >
              <button
                className="page-link"
                onClick={() =>
                  setPage((p) =>
                    Math.min(data.totalPages || 1, p + 1)
                  )
                }
                disabled={page === data.totalPages}
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

export default AdminCategoriesPage;