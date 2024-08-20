import { useEffect } from "react";
import React from "react";
import {Row, Col, ListGroup, Image, Button, Card} from 'react-bootstrap';
import {toast} from 'react-toastify';
import { useSelector } from "react-redux";
import {PayPalButtons, usePayPalScriptReducer} from '@paypal/react-paypal-js'
import Message from '../components/Message';
import Loader from '../components/Loader';
import { useGetOrderDetailsQuery, usePayOrderMutation, useGetPaypalClientIdQuery,useDeliverOrderMutation } from '../slices/ordersApiSlice';
import {Link, useParams} from 'react-router-dom';


const OrderScreen = () => {

  const {id: orderId} = useParams();
  const {data: order, refetch, isLoading,error} = useGetOrderDetailsQuery(orderId);

  const {userInfo} = useSelector((state)=>state.auth);

  const [payOrder, {isLoading: loadingPay}] = usePayOrderMutation();

  const [deliverOrder,{isLoading:loadingDeliver}] = useDeliverOrderMutation()

  const {data: paypal, isLoading:loadingPayPal, error: errorPayPal} = useGetPaypalClientIdQuery();
  const [{isPending}, paypalDispatch] = usePayPalScriptReducer();

  useEffect(()=>{
    if(!errorPayPal && !loadingPayPal && paypal.clientId){
      const loadPaypalScript = async()=> {
        paypalDispatch({
          type:'resetOptions',
          value: {
            'client-id': paypal.clientId,
            currency: 'USD',
          }
        });
        paypalDispatch({type:'setLoadingStatus', value:'pending'});
      }
      if(order && !order.isPaid){
        if(!window.paypal) {
           loadPaypalScript();
        }
      }
    }
  },[order, paypal, paypalDispatch,loadingPayPal,errorPayPal]);


  function onApprove(data, actions){
    return actions.order.capture().then(async function (details) {
        try {
          await payOrder({orderId, details});
          refetch();
          toast.success('Đã thanh toán');
        } catch (err) {
          toast.error(err?.data?.message || err.message);
        }
    })
  }
 async function onApproveTest(){
     await payOrder({orderId, details: {payer: {}}});
     refetch();
     toast.success('Đã thanh toán');
  }
  function onError(){
    toast.error(error.message);
  }

  function createOrder(data, actions){
    return actions.order.create({
      purchase_units:[
        {
          amount:{
            value:order.totalPrice
          }
        }
      ]
    }).then((orderId)=> {
      return orderId;
    });
  }

 

  const deliverOrderHandler = async () => {
    try {
      await deliverOrder(orderId);
      refetch();
      toast.success('Đơn hàng đã giao')
    } catch (err) {
      toast.error(err?.data?.message || err.message)
      
    }
  }

  

  return isLoading ? <Loader/>: error ? <Message variant='danger'/> : (
    <>
    <h1>Đơn hàng {order._id}</h1>
    <Row>
      <Col md={8}>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <h2>Vận chuyển</h2>
            <p><strong>Tên: </strong> {order.user.name}</p>
            <p>
              <strong>Email: </strong> {order.user.email}
            </p>
             <p>
              <strong>Địa chỉ: </strong> 
              {order.shippingAddress.address},{' '}
               {order.shippingAddress.city}, {' '}
               {order.shippingAddress.postalCode},  {' '}
               {order.shippingAddress.country}
            </p>
            {order.isDelivered ? (
              <Message variant='success'>
                Delivered on {order.deliveredAt}
              </Message>
            ) : (
              <Message variant='danger'>Chưa giao hàng</Message>
            )}
          </ListGroup.Item>

          <ListGroup.Item>
            <h2>Phương thức thanh toán</h2>
            <p>
              <strong>Phương thức: </strong>
              {order.paymentMethod}
            </p>

             {order.isPaid ? (
              <Message variant='success'>
                Ngày mua {order.paidAt}
              </Message>
            ) : (
              <Message variant='danger'>Chưa thanh toán</Message>
            )}
          </ListGroup.Item>

          <ListGroup.Item>
            <h2>Các đơn hàng</h2>
            {order.orderItems.map((item, index)=>(
              <ListGroup.Item key={index}>
                <Row>
                  <Col md={1}>
                    <Image src={item.image} alt={item.name} fluid rounded/>
                  </Col>
                  <Col>
                  <Link to={`/product/${item.product}`}>
                    {item.name}
                  </Link>
                  </Col>
                  <Col md={4}>
                   Số lượng: {item.qty} Sản phẩm 
                   <Col>
                   Giá = ${item.qty * item.price}
                   </Col>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup.Item>
        </ListGroup>
      </Col>
      <Col md={4}>
        <Card>  
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Cái Giá Phải Trả</h2>
            </ListGroup.Item>

            <ListGroup.Item>
              <Row>
                <Col>Giá sản phẩm</Col>
                <Col>${order.itemsPrice}</Col>
              </Row>

                <Row>
                <Col>Phí vận chuyển</Col>
                <Col>${order.shippingPrice}</Col>
              </Row>

              <Row>
                <Col>Thuế</Col>
                <Col>${order.taxPrice}</Col>
              </Row>

                <Row>
                <Col>Tổng tiền</Col>
                <Col>${order.totalPrice}</Col>
              </Row>

            </ListGroup.Item>
            {!order.isPaid && (
              <ListGroup.Item>
                {loadingPay && <Loader/>}
                {isPending ? <Loader/> : (
                  <div>
                    {/* <Button onClick={onApproveTest} style={{marginBottom:'10px'}}>Thanh toán đơn hàng</Button> */}
                    <div>
                      <PayPalButtons
                      createOrder={createOrder}
                      onApprove={onApprove} 
                      onError={onError} ></PayPalButtons>
                    </div>
                  </div>
                )}
              </ListGroup.Item>
            )}
            {loadingDeliver && <Loader/>}

            {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
              <ListGroup.Item>
                <Button type="button" className="btn btn-block"
                onClick={deliverOrderHandler}
                >
                  Đánh dấu đã giao 
                </Button>
              </ListGroup.Item>
            )}
          </ListGroup>
        </Card>

      </Col>    
      </Row>
    </>
  );
};

export default OrderScreen;
