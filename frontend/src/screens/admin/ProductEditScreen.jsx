import {React, useState, useEffect} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {Form, Button} from "react-bootstrap";
import Message from '../../components/Message';
import Loader from "../../components/Loader";
import FormContainer from "../../components/FormContainer";
import { toast } from "react-toastify";
import {useUpdateProductMutation, useGetProductDetailsQuery, useUploadProductImageMutation} from "../../slices/productsApiSlice";

const ProductEditScreen = () => {
  const {id: productId} = useParams();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [description, setDescription] = useState('');

  const {data: product, isLoading, refetch, error} = useGetProductDetailsQuery(productId);

  const [updateProduct, {isLoading: loadingUpdate}] = useUpdateProductMutation();

  const [uploadProductImage, {isLoading: loadingUpload}] = useUploadProductImageMutation();

  const navigate = useNavigate();

  useEffect(() => {
    if(product) {
        setName(product.name);
        setPrice(product.price);
        setImage(product.image);
        setBrand(product.brand);
        setCategory(product.category);
        setCountInStock(product.countInStock);
        setDescription(product.description);
    }
  },[product]);

  const submitHandler = async (e) => {
    e.preventDefault();
    const updatedProduct = {
        productId,
        name,
        price,
        image,
        brand,
        category,
        countInStock,
        description,
    };
    const result = await updateProduct(updatedProduct);
    if(result.error) {
        toast.error(result.error);
    }else{
      toast.success('Cập nhật sản phẩm');
      navigate('/admin/productlist');
    }
  };

  const uploadFileHandler = async (e) => {
  const formData = new FormData();
  formData.append('image', e.target.files[0]);
  try {
    const res = await uploadProductImage(formData).unwrap();
    toast.success(res.message);
    setImage(res.image);
  } catch (err) {
    toast.error(err?.data?.message || err.error)
    
  }
  };


  return <>
  <Link to="/admin/productlist" className="btn btn-light my-3">
    Trở lại
  </Link>
  <FormContainer>
    <h1>Sửa Sản Phẩm</h1>
    {loadingUpdate && <Loader/>}
    {isLoading ? <Loader/> : error ? <Message variant='danger'>{error}</Message>: (
        <Form onSubmit={submitHandler}>
            <Form.Group controlId="name" className="my-2" >
                <Form.Label>Name</Form.Label>
                <Form.Control type="text" placeholder="Nhập Tên" value={name} onChange={(e)=> setName(e.target.value)}></Form.Control>
            </Form.Group>

             <Form.Group controlId="price" className="my-2">
                <Form.Label>Giá</Form.Label>
                <Form.Control type="number" placeholder="Nhập Giá" value={price} onChange={(e)=> setPrice(e.target.value)}></Form.Control>
            </Form.Group>

            <Form.Group controlId="image" className="my-2">
              <Form.Label>Ảnh</Form.Label>
              <Form.Control type="text" 
              placeholder="Nhập url ảnh" 
              value={image} 
              onChange={(e) => setImage}> 
              </Form.Control>
              <Form.Control 
              type="file" 
              label='Chọn file' 
              onChange={uploadFileHandler}></Form.Control>
            </Form.Group>
    {loadingUpload && <Loader/>}


              <Form.Group controlId="brand" className="my-2">
                <Form.Label>Thương hiệu</Form.Label>
                <Form.Control type="text" placeholder="Nhập Tên Thương hiệu" value={brand} onChange={(e)=> setBrand(e.target.value)}></Form.Control>
            </Form.Group>

              <Form.Group controlId="countInStock" className="my-2">
                <Form.Label>số lượng hàng</Form.Label>
                <Form.Control type="number" placeholder="Nhập Số lượng" value={countInStock} onChange={(e)=> setCountInStock(e.target.value)}></Form.Control>
            </Form.Group>

            <Form.Group controlId="category" className="my-2">
                <Form.Label>Loại</Form.Label>
                <Form.Control type="text" placeholder="Nhập Loại" value={category} onChange={(e)=> setCategory(e.target.value)}></Form.Control>
            </Form.Group>

             <Form.Group controlId="description" className="my-2">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control type="text" placeholder="Nhập Mô tả" value={description} onChange={(e)=> setDescription(e.target.value)}></Form.Control>
            </Form.Group>

            <Button type="submit" variant="primary" className="my-2">
                Cập nhật
            </Button>
        </Form>
    )}
  </FormContainer>
  </>;
};

export default ProductEditScreen;
