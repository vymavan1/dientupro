import {React, useState, useEffect} from "react";
import {Table, Form, Button, Row, Col} from 'react-bootstrap';
import { LinkContainer } from "react-router-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {toast} from "react-toastify";
import Message from "../components/Message";
import Loader from "../components/Loader";
import {FaTimes} from 'react-icons/fa'
import { useProfileMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import { useGetMyOrdersQuery } from "../slices/ordersApiSlice";

const ProfileScreen = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const dispatch = useDispatch();

    const {userInfo} = useSelector((state)=> state.auth);

    const [updateProfile, {isLoading:loadingUpdateProfile}] = useProfileMutation();

    const {data:orders, isLoading, error} = useGetMyOrdersQuery()

    useEffect(()=>{
        if(userInfo){
            setName(userInfo.name);
            setEmail(userInfo.email);
        }


    },[userInfo, userInfo.name, userInfo.email]);

  const submitHandler = async(e)=>{
    e.preventDefault();
    if(password !== confirmPassword) {
      toast.error('Mật khẩu không khớp')
    }else {
        try {
            const res = await updateProfile({_id:userInfo._id, name, email, password}).unwrap();
            dispatch(setCredentials(res));
            toast.success('Profile updated successfully');
        } catch (err) {
            toast.error(err?.data?.message || err.error );
        }
    }
  }
    
  return <Row>
    <Col md={3}>
        <h2>Hồ sơ người dùng</h2>
        <Form onSubmit={submitHandler}>
            <Form.Group controlId="name" className="my-2">
                <Form.Label>Tên</Form.Label>
                <Form.Control type="name" 
                placeholder="Nhập tên"
                value={name}
                onChange={(e)=> setName(e.target.value)}
                 >

                </Form.Control>
            </Form.Group>

             <Form.Group controlId="email" className="my-2">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" 
                placeholder="Nhập Email"
                value={email}
                onChange={(e)=> setEmail(e.target.value)}
                 >

                </Form.Control>
            </Form.Group>

             <Form.Group controlId="password" className="my-2">
                <Form.Label>Mật khẩu</Form.Label>
                <Form.Control type="password" 
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e)=> setPassword(e.target.value)}
                 >

                </Form.Control>
            </Form.Group>

              <Form.Group controlId="confirmPassword" className="my-2">
                <Form.Label>Nhập lại mật khẩu</Form.Label>
                <Form.Control type="password" 
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e)=> setConfirmPassword(e.target.value)}
                 >

                </Form.Control>
            </Form.Group>

            <Button type="submit" variant="primary" className="my-2">
                Cập nhật
            </Button>
            {loadingUpdateProfile && <Loader/>}
        </Form>
    </Col>
    <Col md={9}>
        <h2>My Orders</h2>
        {isLoading ? <Loader/> : error ? (<Message variant='danger'>
        {error?.data?.message || error.error}
        </Message>): (
            <Table striped hover responsive className="table-sm">
             <thead>
                <tr>
                    <th>Mã Đơn Hàng</th>
                    <th>Ngày</th>
                    <th>Tổng Tiền</th>
                    <th>Thanh Toán Ngày</th>
                    <th>Vận Chuyển</th>
                    <th></th>
                </tr>
                                </thead>
                    <tbody>
                        {orders.map((order)=> (
                            <tr key={order._id}>
                                <td>{order._id}</td>
                                <td>{order.createdAt.substring(0, 10)}</td>
                                <td>${order.totalPrice}</td>
                                <td>
                                    {order.isPaid ? (
                                        order.paidAt.substring(0, 10)
                                    ) : (
                                        <FaTimes style={{color: 'red'}}/>
                                    )}
                                </td>

                                 <td>
                                    {order.isDelivered ? (
                                        order.deliveredAt.substring(0, 10)
                                    ) : (
                                        <FaTimes style={{color: 'red'}}/>
                                    )}
                                </td>
                                <td>
                                   <LinkContainer to={`/order/${order._id}`}>
                                     <Button className="btn-sm" variant="light">
                                        Chi tiết
                                     </Button>
                                   </LinkContainer>
                                </td>
                            </tr>
                        ))}
                    </tbody>
            </Table>
        )}
    </Col>

  </Row>;
};

export default ProfileScreen;
