import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, ImagePlus, X, Search, Upload, Package } from 'lucide-react';

interface ProductImage {
  id?: number;
  src?: string;
  url?: string;
}

interface ProductVariant {
  id?: number;
  title: string;
  price: string;
  compare_at_price?: string | null;
  sku?: string;
  option1?: string | null;
  option2?: string | null;
  option3?: string | null;
  inventory_quantity?: number;
  inventory_item_id?: number;
}

interface ProductOption {
  name: string;
  values: string[];
}

interface Product {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string;
  images: ProductImage[];
  variants: ProductVariant[];
  options: ProductOption[];
  status: string;
}

interface VariantFormData {
  id?: number;
  option1: string;
  option2: string;
  price: string;
  compare_at_price: string;
  sku: string;
  inventory_quantity: number;
}

interface ProductFormData {
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string;
  images: string[];
  newImageUrl: string;
  // Options
  hasVariants: boolean;
  option1Name: string;
  option1Values: string[];
  newOption1Value: string;
  option2Name: string;
  option2Values: string[];
  newOption2Value: string;
  // Variants
  variants: VariantFormData[];
  // Simple product (no variants)
  simplePrice: string;
  simpleCompareAtPrice: string;
  simpleInventory: number;
}

const PRODUCT_TYPES = [
  { value: 'сорочки', label: 'Сорочки' },
  { value: 'трусы', label: 'Трусы' },
  { value: 'бюстгальтеры', label: 'Бюстгальтеры' },
  { value: 'наборы', label: 'Наборы' },
  { value: 'другое', label: 'Другое' },
];

const COMMON_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];
const COMMON_COLORS = ['Чёрный', 'Белый', 'Красный', 'Розовый', 'Бежевый', 'Синий', 'Бордовый'];

const initialFormData: ProductFormData = {
  title: '',
  body_html: '',
  vendor: 'Бесценки',
  product_type: '',
  tags: '',
  images: [],
  newImageUrl: '',
  hasVariants: false,
  option1Name: 'Размер',
  option1Values: [],
  newOption1Value: '',
  option2Name: 'Цвет',
  option2Values: [],
  newOption2Value: '',
  variants: [],
  simplePrice: '',
  simpleCompareAtPrice: '',
  simpleInventory: 0,
};

// Generate all variant combinations
const generateVariants = (
  option1Values: string[],
  option2Values: string[],
  existingVariants: VariantFormData[]
): VariantFormData[] => {
  const variants: VariantFormData[] = [];
  
  if (option1Values.length === 0 && option2Values.length === 0) {
    return variants;
  }
  
  const opt1 = option1Values.length > 0 ? option1Values : [''];
  const opt2 = option2Values.length > 0 ? option2Values : [''];
  
  for (const v1 of opt1) {
    for (const v2 of opt2) {
      const existing = existingVariants.find(
        (ev) => ev.option1 === v1 && ev.option2 === v2
      );
      
      variants.push({
        id: existing?.id,
        option1: v1,
        option2: v2,
        price: existing?.price || '',
        compare_at_price: existing?.compare_at_price || '',
        sku: existing?.sku || '',
        inventory_quantity: existing?.inventory_quantity || 0,
      });
    }
  }
  
  return variants;
};

export default function Products() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `https://dtazyqdkbjorltcfxckw.supabase.co/functions/v1/shopify-admin/products`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch products');
      }
      
      const data = await response.json();
      return data.products || [];
    },
  });

  // Upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Upload error: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} не является изображением`);
          continue;
        }
        
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} превышает 5MB`);
          continue;
        }

        const url = await uploadImage(file);
        uploadedUrls.push(url);
      }

      if (uploadedUrls.length > 0) {
        setFormData({
          ...formData,
          images: [...formData.images, ...uploadedUrls],
        });
        toast.success(`Загружено ${uploadedUrls.length} изображений`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Ошибка при загрузке изображений');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      let productData: any = {
        title: data.title,
        body_html: data.body_html,
        vendor: data.vendor,
        product_type: data.product_type,
        tags: data.tags,
        images: data.images.map(url => ({ src: url })),
      };

      if (data.hasVariants && data.variants.length > 0) {
        const options: { name: string; values: string[] }[] = [];
        if (data.option1Values.length > 0) {
          options.push({ name: data.option1Name, values: data.option1Values });
        }
        if (data.option2Values.length > 0) {
          options.push({ name: data.option2Name, values: data.option2Values });
        }
        
        productData.options = options;
        productData.variants = data.variants
          .filter(v => v.price)
          .map(v => ({
            option1: v.option1 || null,
            option2: v.option2 || null,
            price: v.price,
            compare_at_price: v.compare_at_price || null,
            sku: v.sku || null,
            inventory_quantity: v.inventory_quantity || 0,
          }));
      } else {
        productData.variants = [{
          price: data.simplePrice,
          compare_at_price: data.simpleCompareAtPrice || null,
          inventory_quantity: data.simpleInventory || 0,
        }];
      }

      const response = await fetch(
        `https://dtazyqdkbjorltcfxckw.supabase.co/functions/v1/shopify-admin/products`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create product');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Товар успешно создан');
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductFormData }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      let productData: any = {
        title: data.title,
        body_html: data.body_html,
        vendor: data.vendor,
        product_type: data.product_type,
        tags: data.tags,
        images: data.images.map(url => ({ src: url })),
      };

      if (data.hasVariants && data.variants.length > 0) {
        const options: { name: string; values: string[] }[] = [];
        if (data.option1Values.length > 0) {
          options.push({ name: data.option1Name, values: data.option1Values });
        }
        if (data.option2Values.length > 0) {
          options.push({ name: data.option2Name, values: data.option2Values });
        }
        
        productData.options = options;
        productData.variants = data.variants
          .filter(v => v.price)
          .map((v) => {
            const existingVariant = editingProduct?.variants.find(
              ev => ev.option1 === v.option1 && ev.option2 === v.option2
            );
            return {
              id: existingVariant?.id || v.id,
              option1: v.option1 || null,
              option2: v.option2 || null,
              price: v.price,
              compare_at_price: v.compare_at_price || null,
              sku: v.sku || null,
            };
          });
      } else {
        productData.variants = editingProduct?.variants.map(v => ({
          id: v.id,
          price: data.simplePrice,
          compare_at_price: data.simpleCompareAtPrice || null,
        })) || [{ price: data.simplePrice, compare_at_price: data.simpleCompareAtPrice || null }];
      }

      const response = await fetch(
        `https://dtazyqdkbjorltcfxckw.supabase.co/functions/v1/shopify-admin/products/${id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update product');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Товар успешно обновлён');
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });

  // Update inventory mutation
  const updateInventoryMutation = useMutation({
    mutationFn: async ({ variantId, quantity }: { variantId: number; quantity: number }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `https://dtazyqdkbjorltcfxckw.supabase.co/functions/v1/shopify-admin/inventory/${variantId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update inventory');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Остатки обновлены');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `https://dtazyqdkbjorltcfxckw.supabase.co/functions/v1/shopify-admin/products/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete product');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Товар успешно удалён');
      setIsDeleting(null);
    },
    onError: (error: Error) => {
      toast.error(`Ошибка: ${error.message}`);
      setIsDeleting(null);
    },
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    
    const hasMultipleVariants = product.variants.length > 1 || 
      (product.options && product.options.length > 0 && product.options[0]?.name !== 'Title');
    
    const option1 = product.options?.[0];
    const option2 = product.options?.[1];
    
    const variants: VariantFormData[] = product.variants.map(v => ({
      id: v.id,
      option1: v.option1 || '',
      option2: v.option2 || '',
      price: v.price || '',
      compare_at_price: v.compare_at_price || '',
      sku: v.sku || '',
      inventory_quantity: v.inventory_quantity || 0,
    }));

    setFormData({
      title: product.title,
      body_html: product.body_html || '',
      vendor: product.vendor || 'Бесценки',
      product_type: product.product_type || '',
      tags: product.tags || '',
      images: product.images.map(img => img.src || img.url || '').filter(Boolean),
      newImageUrl: '',
      hasVariants: hasMultipleVariants,
      option1Name: option1?.name || 'Размер',
      option1Values: option1?.values || [],
      newOption1Value: '',
      option2Name: option2?.name || 'Цвет',
      option2Values: option2?.values || [],
      newOption2Value: '',
      variants: hasMultipleVariants ? variants : [],
      simplePrice: !hasMultipleVariants ? (product.variants[0]?.price || '') : '',
      simpleCompareAtPrice: !hasMultipleVariants ? (product.variants[0]?.compare_at_price || '') : '',
      simpleInventory: !hasMultipleVariants ? (product.variants[0]?.inventory_quantity || 0) : 0,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Введите название товара');
      return;
    }
    
    if (formData.hasVariants) {
      const hasValidVariant = formData.variants.some(v => v.price);
      if (!hasValidVariant) {
        toast.error('Добавьте хотя бы один вариант с ценой');
        return;
      }
    } else {
      if (!formData.simplePrice.trim()) {
        toast.error('Введите цену товара');
        return;
      }
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleAddImage = () => {
    if (formData.newImageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, formData.newImageUrl.trim()],
        newImageUrl: '',
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleAddOption1Value = (value: string) => {
    if (value && !formData.option1Values.includes(value)) {
      const newValues = [...formData.option1Values, value];
      const newVariants = generateVariants(newValues, formData.option2Values, formData.variants);
      setFormData({
        ...formData,
        option1Values: newValues,
        newOption1Value: '',
        variants: newVariants,
      });
    }
  };

  const handleRemoveOption1Value = (value: string) => {
    const newValues = formData.option1Values.filter(v => v !== value);
    const newVariants = generateVariants(newValues, formData.option2Values, formData.variants);
    setFormData({
      ...formData,
      option1Values: newValues,
      variants: newVariants,
    });
  };

  const handleAddOption2Value = (value: string) => {
    if (value && !formData.option2Values.includes(value)) {
      const newValues = [...formData.option2Values, value];
      const newVariants = generateVariants(formData.option1Values, newValues, formData.variants);
      setFormData({
        ...formData,
        option2Values: newValues,
        newOption2Value: '',
        variants: newVariants,
      });
    }
  };

  const handleRemoveOption2Value = (value: string) => {
    const newValues = formData.option2Values.filter(v => v !== value);
    const newVariants = generateVariants(formData.option1Values, newValues, formData.variants);
    setFormData({
      ...formData,
      option2Values: newValues,
      variants: newVariants,
    });
  };

  const handleVariantChange = (index: number, field: keyof VariantFormData, value: string | number) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const handleApplyPriceToAll = () => {
    const firstPrice = formData.variants[0]?.price;
    const firstCompare = formData.variants[0]?.compare_at_price;
    if (firstPrice) {
      const newVariants = formData.variants.map(v => ({
        ...v,
        price: firstPrice,
        compare_at_price: firstCompare || '',
      }));
      setFormData({ ...formData, variants: newVariants });
      toast.success('Цена применена ко всем вариантам');
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
      setIsDeleting(id);
      deleteMutation.mutate(id);
    }
  };

  const getTotalInventory = (product: Product): number => {
    return product.variants.reduce((sum, v) => sum + (v.inventory_quantity || 0), 0);
  };

  const filteredProducts = products?.filter((product: Product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.product_type?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const formatPrice = (price: string) => {
    return `${parseFloat(price).toLocaleString()} сом`;
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Управление товарами</h2>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить товар
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <CardTitle className="text-lg">
              Всего: {filteredProducts.length} товаров
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'Товары не найдены' : 'Нет товаров'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Фото</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Варианты</TableHead>
                  <TableHead>Остаток</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead className="w-24">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product: Product) => {
                  const totalInventory = getTotalInventory(product);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        {product.images[0] ? (
                          <img
                            src={product.images[0].src || product.images[0].url}
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <ImagePlus className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{product.title}</TableCell>
                      <TableCell>{product.product_type || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {product.variants?.length || 1} вар.
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={totalInventory > 0 ? 'default' : 'destructive'}>
                          <Package className="h-3 w-3 mr-1" />
                          {totalInventory} шт.
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.variants[0] ? formatPrice(product.variants[0].price) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                            disabled={isDeleting === product.id}
                          >
                            {isDeleting === product.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Редактировать товар' : 'Добавить товар'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Название *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Название товара"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product_type">Категория</Label>
                <Select
                  value={formData.product_type}
                  onValueChange={(value) => setFormData({ ...formData, product_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body_html">Описание</Label>
              <Textarea
                id="body_html"
                value={formData.body_html}
                onChange={(e) => setFormData({ ...formData, body_html: e.target.value })}
                placeholder="Описание товара"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vendor">Бренд</Label>
                <Input
                  id="vendor"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="Название бренда"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Теги (через запятую)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="тег1, тег2, тег3"
                />
              </div>
            </div>

            {/* Variants Toggle */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <input
                type="checkbox"
                id="hasVariants"
                checked={formData.hasVariants}
                onChange={(e) => setFormData({ ...formData, hasVariants: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="hasVariants" className="cursor-pointer">
                Товар с вариантами (размеры, цвета)
              </Label>
            </div>

            {/* Simple Price (no variants) */}
            {!formData.hasVariants && (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="simplePrice">Цена (сом) *</Label>
                  <Input
                    id="simplePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.simplePrice}
                    onChange={(e) => setFormData({ ...formData, simplePrice: e.target.value })}
                    placeholder="0.00"
                    required={!formData.hasVariants}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="simpleCompareAtPrice">Старая цена (сом)</Label>
                  <Input
                    id="simpleCompareAtPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.simpleCompareAtPrice}
                    onChange={(e) => setFormData({ ...formData, simpleCompareAtPrice: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="simpleInventory">Остаток (шт.)</Label>
                  <Input
                    id="simpleInventory"
                    type="number"
                    min="0"
                    value={formData.simpleInventory}
                    onChange={(e) => setFormData({ ...formData, simpleInventory: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>
            )}

            {/* Variants Section */}
            {formData.hasVariants && (
              <Accordion type="single" collapsible defaultValue="options" className="border rounded-lg">
                <AccordionItem value="options" className="border-none">
                  <AccordionTrigger className="px-4">Настройка вариантов</AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 space-y-4">
                    {/* Option 1 (Size) */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label>Опция 1:</Label>
                        <Input
                          value={formData.option1Name}
                          onChange={(e) => setFormData({ ...formData, option1Name: e.target.value })}
                          className="w-32"
                          placeholder="Размер"
                        />
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {formData.option1Values.map((value) => (
                          <Badge key={value} variant="secondary" className="gap-1">
                            {value}
                            <button
                              type="button"
                              onClick={() => handleRemoveOption1Value(value)}
                              className="hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          value={formData.newOption1Value}
                          onChange={(e) => setFormData({ ...formData, newOption1Value: e.target.value })}
                          placeholder={`Добавить ${formData.option1Name.toLowerCase()}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddOption1Value(formData.newOption1Value);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleAddOption1Value(formData.newOption1Value)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {formData.option1Name.toLowerCase() === 'размер' && (
                        <div className="flex flex-wrap gap-1">
                          {COMMON_SIZES.filter(s => !formData.option1Values.includes(s)).map((size) => (
                            <Button
                              key={size}
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => handleAddOption1Value(size)}
                            >
                              + {size}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Option 2 (Color) */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label>Опция 2:</Label>
                        <Input
                          value={formData.option2Name}
                          onChange={(e) => setFormData({ ...formData, option2Name: e.target.value })}
                          className="w-32"
                          placeholder="Цвет"
                        />
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {formData.option2Values.map((value) => (
                          <Badge key={value} variant="secondary" className="gap-1">
                            {value}
                            <button
                              type="button"
                              onClick={() => handleRemoveOption2Value(value)}
                              className="hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          value={formData.newOption2Value}
                          onChange={(e) => setFormData({ ...formData, newOption2Value: e.target.value })}
                          placeholder={`Добавить ${formData.option2Name.toLowerCase()}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddOption2Value(formData.newOption2Value);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleAddOption2Value(formData.newOption2Value)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {formData.option2Name.toLowerCase() === 'цвет' && (
                        <div className="flex flex-wrap gap-1">
                          {COMMON_COLORS.filter(c => !formData.option2Values.includes(c)).map((color) => (
                            <Button
                              key={color}
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => handleAddOption2Value(color)}
                            >
                              + {color}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Variants Table */}
                    {formData.variants.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Варианты ({formData.variants.length})</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleApplyPriceToAll}
                          >
                            Применить цену ко всем
                          </Button>
                        </div>
                        
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {formData.option1Values.length > 0 && (
                                  <TableHead>{formData.option1Name}</TableHead>
                                )}
                                {formData.option2Values.length > 0 && (
                                  <TableHead>{formData.option2Name}</TableHead>
                                )}
                                <TableHead>Цена *</TableHead>
                                <TableHead>Старая цена</TableHead>
                                <TableHead>Остаток</TableHead>
                                <TableHead>Артикул</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {formData.variants.map((variant, index) => (
                                <TableRow key={`${variant.option1}-${variant.option2}`}>
                                  {formData.option1Values.length > 0 && (
                                    <TableCell className="font-medium">{variant.option1}</TableCell>
                                  )}
                                  {formData.option2Values.length > 0 && (
                                    <TableCell>{variant.option2}</TableCell>
                                  )}
                                  <TableCell>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={variant.price}
                                      onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                      placeholder="0.00"
                                      className="w-20"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={variant.compare_at_price}
                                      onChange={(e) => handleVariantChange(index, 'compare_at_price', e.target.value)}
                                      placeholder="0.00"
                                      className="w-20"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={variant.inventory_quantity}
                                      onChange={(e) => handleVariantChange(index, 'inventory_quantity', parseInt(e.target.value) || 0)}
                                      placeholder="0"
                                      className="w-16"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      value={variant.sku}
                                      onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                                      placeholder="SKU"
                                      className="w-20"
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            {/* Images section */}
            <div className="space-y-3">
              <Label>Изображения</Label>
              
              {/* File upload */}
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Загрузить файлы
                </Button>
              </div>
              
              {/* URL input */}
              <div className="flex gap-2">
                <Input
                  value={formData.newImageUrl}
                  onChange={(e) => setFormData({ ...formData, newImageUrl: e.target.value })}
                  placeholder="Или введите URL изображения"
                />
                <Button type="button" variant="outline" onClick={handleAddImage}>
                  <ImagePlus className="h-4 w-4" />
                </Button>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingProduct ? 'Сохранить' : 'Создать'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
