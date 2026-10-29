export interface Produto {
  id?: string;
  nome: string;
  preco: number;
  categoria?: string;
  imagem?: string;
  imagens?: string[];
  descricao?: string;
  cores?: string[];
  tamanhos?: string[];
  capacidades?: string[];
}