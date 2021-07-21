import {all, put, select} from 'redux-saga/effects';
import {useState} from 'react';
import {endpointSaga, takeEvery} from '@oracle-cx-commerce/store/utils';
import {getProduct,getCurrentProduct,getCurrentSiteId,getGlobalContext,getCurrentOrderId,getOrders,getProfileRepository,getCatalogRepository,getCurrentProfileId} from '@oracle-cx-commerce/commerce-utils/selector';
import {ProductContext, ContainerContext, ProductSelectionContext} from '@oracle-cx-commerce/react-ui/contexts';
//import {StoreContext} from '@oracle-cx-commerce/react-ui/contexts';



let priceChangeFlag = false;
let partNo;
let leadTime;
let uom;
let currentSiteId,ShipToNo,BillToNo,ProductLine; 
let errorObj;

function partNumberFinder(state,id) {
   /* const product = getProduct(state,id);
    console.log("part->"+product.sundyne_partNumber+"lead_time"+product.sundyne_lead_time+"uom"+product.sundyne_uom);
    partNo = product.sundyne_partNumber;
    leadTime =product.sundyne_lead_time;
    uom= product.sundyne_uom;
    const details = getOrders(state)[getCurrentOrderId(state)];
    console.log("Current order details"+JSON.stringify(details));
    currentSiteId= getGlobalContext(state).site;
    console.log("Side id"+currentSiteId);*/
   //const dyn = getSundyneDynamicPropertyRepository(state);
   //console.log("Global Selector dynaimc data"+JSON.stringify(dyn));
   console.log("profile data"+JSON.stringify(getProfileRepository(state)));
   const profile =getProfileRepository(state);
   console.log(JSON.stringify(getCurrentProfileId(state)));
   const profileID = getCurrentProfileId(state);
   console.log("shipzTO"+profile.profiles[profileID].dynamicProperties[0].value);
   ShipToNo=profile.profiles[profileID].dynamicProperties[0].value;
   console.log("BillTo"+profile.profiles[profileID].dynamicProperties[1].value);
   BillToNo=profile.profiles[profileID].dynamicProperties[1].value
   console.log("Product line"+profile.profiles[profileID].dynamicProperties[2].value);
   ProductLine=profile.profiles[profileID].dynamicProperties[2].value
   //console.log("profile data"+JSON.stringify(getProfileCustomProperties(state)["sundyne_selected_billto"]))
  //return product;
  
};

/**
 * Saga that updates the application state. The code runs saga when the reducer flag is not supplied.
 * There are three options to consider:
 * 1. Create a custom action by default
 *    example: yarn occ create-action —-action-name getCurrency
 * 2. Create a custom action which invokes an endpoint with the same name as the action-name
 *    example: yarn occ create-action —-action-name getCurrency —-endpoint
 * 3. Create a custom action which invokes an endpoint with a different name as the action-name
 *    example: yarn occ create-action —-action-name testCurrency —-endpoint getCurrency
 */

function* addItemsToCartSaga(action) {
  errorObj="";
  console.log("action",action)
  let response=[]
  for (var i=0;i<action.payload.items.length;i++){

    
    if(action.payload.items[i].productId){
     
      const siteData = yield select(getCurrentSiteId);
      console.log("Site deatils ghj"+siteData)
      const ProductData = yield select(getProduct);
      console.log("Site deatils ghj"+ProductData)
      const state = yield select();
      //setTimeout(() => {
      partNumberFinder(state,action.payload.items[i].productId);
       //partNo =partNumberFinder(state,action.payload.items[i].productId).sundyne_partNumber;
       //leadTime= partNumberFinder(state,action.payload.items[i].productId).sundyne_lead_time;
       //uom = partNumberFinder(state,action.payload.items[i].productId).sundyne_uom;
       //console.log("commerc related data"+partNo+" lead "+leadTime);
       currentSiteId= getGlobalContext(state).site;
       console.log("Site data"+currentSiteId)
    /*   console.log(JSON.stringify(state.catalogRepository));
       if(partNo[i]===undefined)
       partNo[i]=state.catalogRepository.products[action.payload.items[i].productId].sundyne_partNumber;
       if(leadTime[i]===undefined)
       leadTime[i]=state.catalogRepository.products[action.payload.items[i].productId].sundyne_lead_time;
       if(uom[i]===undefined)
       uom[i]=state.catalogRepository.products[action.payload.items[i].productId].sundyne_uom; 
  */
      let Prodresponse= yield endpointSaga({...action, payload: {
        productId : action.payload.items[i].productId
        }, type: 'getProduct'});
        if(Prodresponse.status!==200)
        {
          console.log(Prodresponse.error.Message);
          errorObj=errorObj+Prodresponse.error.Message;
        }
        if(Prodresponse.ok){
       // console.log(Prodresponse.sundyne_partNumber+" "+Prodresponse.sundyne_lead_time+"**** "+Prodresponse.sundyne_uom)
partNo=Prodresponse.delta.catalogRepository.products[action.payload.items[i].productId].sundyne_partNumber
leadTime=Prodresponse.delta.catalogRepository.products[action.payload.items[i].productId].sundyne_lead_time
uom=Prodresponse.delta.catalogRepository.products[action.payload.items[i].productId].sundyne_uom}
//}, 3000);
}
  if(action.payload.items[i].NetPriceflag == priceChangeFlag){
    console.log("no net price call");
   // response = yield all([
    let Availresponse = yield endpointSaga({...action, payload: {
        partNumber : partNo,//"08-011AA",
        siteId : currentSiteId//"330100"
        }, type: 'GetItemAvailability'});
    let Crossresponse = yield endpointSaga({...action, payload: {
        partNumber : partNo, //"08-011AA",
        billToNo : BillToNo,//"201427",
        siteId : currentSiteId//"330100"
        }, type: 'GetCustomerItemRefNo'})
      //]);
      
  //  if (response.every((resp)=>resp.ok===true)) {
      console.log("responseSaga2",response)
      action.payload.items[i].dynamicProperties=[];
      if(Availresponse.ok){
        if(Availresponse.json.Status!=='Failure'){
      action.payload.items[i].sundyne_item_availability=Availresponse.json.availability}}
      if(Availresponse.status!==200){
        console.log("error in avaialbitlity"+Availresponse.error.Message);
        errorObj=errorObj+Availresponse.error.Message
      }
      if(Crossresponse.ok){
        if(Crossresponse.json.Status!=='Failure'){
      action.payload.items[i].sundyne_item_cross_ref_no=Crossresponse.json.customerItemNumber}}
      if(Crossresponse.status!==200){
        console.log("error in refNUmber"+Crossresponse.error.Message);
        errorObj=errorObj+Crossresponse.error.Message
      }

      action.payload.items[i].sundyne_part_number=partNo//"08-011AA"
      action.payload.items[i].sundyne_lead_time=leadTime
      action.payload.sundyne_order_type="SO"
      action.payload.items[i].sundyne_uom =uom
   // }
  
  
  }
  else{
    console.log("net price call should happen");
  //  response = yield all([
    let NetPriceresponse = yield endpointSaga({...action, payload: {
        partNumber : partNo,//"08-011AA",
        productLine : ProductLine,//selectorprops.selectedProductLine,//"SM",
        shipToCountry : "US",
        shipToNo : ShipToNo,//"202471",
        billToNo : BillToNo,//"201427",
        siteId : currentSiteId,//"330100",
        quantity :1
        }, type: 'externalPrice'});
        if(NetPriceresponse.ok){
          if(NetPriceresponse.json.Status!=='Failure'){
          action.payload.items[i].externalPrice=NetPriceresponse.json.netPrice;
          //action.payload.items[i].externalPriceQuantity= response[0].json.externalPriceQuantity,
          
          action.payload.items[i].externalPriceQuantity= -1}}
        if(NetPriceresponse.status!==200){
          errorObj= errorObj+NetPriceresponse.error.Message
        }
    let Availresponse=yield endpointSaga({...action, payload: {
        partNumber : partNo,//"08-011AA",
        siteId : currentSiteId//"330100"
        }, type: 'GetItemAvailability'});
        action.payload.items[i].dynamicProperties=[];
        if(Availresponse.status!==200){
          console.log("error in avaialbitlity"+Availresponse.error.Message);
          errorObj= errorObj+Availresponse.error.Message
        }
        if(Availresponse.ok){
          if(Availresponse.json.Status!=='Failure'){
        action.payload.items[i].sundyne_item_availability=Availresponse.json.availability}}
        if(Availresponse.status!==200){
          errorObj= errorObj+Availresponse.error.Message
        }
    let Crossresponse= yield endpointSaga({...action, payload: {
        partNumber : partNo,//"08-011AA",
        billToNo : BillToNo,//"201427",
        siteId : currentSiteId//"330100"
        }, type: 'GetCustomerItemRefNo'}) 
        //]);
    
     console.log("responseSaga",response)
      
   // if (response.every((resp)=>resp.ok===true)) {
      console.log("responseSaga2",response)
      //console.log('External price'+response[0].json.netPrice),

     
      if(Crossresponse.ok){
        if(Crossresponse.json.Status!=='Failure'){
      action.payload.items[i].sundyne_item_cross_ref_no=Crossresponse.json.customerItemNumber}}
      if(Crossresponse.status!==200){
        errorObj= errorObj+Crossresponse.error.Message
      }
      action.payload.items[i].sundyne_part_number=partNo//"08-011AA"
      action.payload.items[i].sundyne_lead_time=leadTime
      action.payload.sundyne_order_type="SO"
      action.payload.items[i].sundyne_uom =uom
   // }
    
  }
  //end else before this
  }
  

    console.log("actionbeforecall",action)
  //  if (response.every((resp)=>resp.ok===true)) {    
    response = yield endpointSaga({action, payload: action.payload, endpointId: 'addItemsToCart'});
 //   }
 //response.error.Message=errorObj;
    return response;
  }
  
  /**
   * The addItemsToCart action.
   *
   * This exports a generator function named "saga", whose presence signals OSF to pass
   * the generator function to Redux-Saga's middleware. Run API the first time the action
   * is dispatched via the store API.
   *
   * The generator function results in an asynchronous endpoint invocation
   * when the action is dispatched.
   */
  export default {
    *saga() {
      //yield takeEvery('addItemsToCart', addItemsToCartSaga);
      yield all([
      takeEvery('addItemsToCart', addItemsToCartSaga),
      takeEvery('deleteItemFromCart', endpointSaga),
      takeEvery('deleteItemsFromCart', endpointSaga),
      takeEvery('getCartItem', endpointSaga),
      takeEvery('getCartItems', endpointSaga),
      takeEvery('updateCartItem', endpointSaga),
      takeEvery('updateCartItems', endpointSaga)
    ]);
    }
  };
  
  /**
   * TODO : Extract the information from the response and append the required properties in the payload property under action.
   * perform the required logic here and then call the addItemsToCart endpoint.
   * externalPrice response will be present under the json property of response.
   */
  //action.payload.items[0].externalPrice=response.json.netPrice,
  //action.payload.items[0].externalPriceQuantity= -1,
  //code to add get availablity, itemcrossref number, productline by org can be place here to append in
  // the payload for modifying commerceitem level changes