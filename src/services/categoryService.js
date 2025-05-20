import supabase from './supabase';

const categoryService = {
  async getCategoriesByPage(page = 1, limit = 12) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
  
    const { data, error, count } = await supabase
      .from('product_category')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('category_name', { ascending: true });
    if (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
    return {
      categories: data,
      total: count,
      totalPages: Math.ceil(count / limit)
    };
  },

  // Criar categoria
  async createCategory(category) {
    const { data, error } = await supabase
      .from('product_category')
      .insert([category])
      .select();
    if (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
    return data[0];
  },

  // Atualizar categoria
  async updateCategory(id, category) {
    const { data, error } = await supabase
      .from('product_category')
      .update(category)
      .eq('id', id)
      .select();
    if (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }
    return data[0];
  },

  // Deletar categoria
  async deleteCategory(id) {
    const { error } = await supabase
      .from('product_category')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Erro ao deletar categoria:', error);
      throw error;
    }
    return true;
  },

};

export default categoryService;