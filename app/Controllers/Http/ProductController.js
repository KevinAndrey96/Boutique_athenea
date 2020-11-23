'use strict'
const Product = use('App/Models/Product')
const Client = use('App/Models/Client')
const Category = use('App/Models/Category')
const Order = use('App/Models/Order')
const OrderProduct = use('App/Models/OrderProduct')

class ProductController {
    async index({ params, view }) {
        const product = await Product.find(params.id);
        product.price=this.formatCurrency("es-CO", "COP", 0, product.price);
        const relateds= await Product.query().where("category","=",product.category).where("id","!=",product.id).fetch()
        const categories=await Category.all()
        console.log(product)
        return view.render("product_detail", {product, relateds: relateds.toJSON(), categories: categories.toJSON()});
      }
      formatCurrency (locales, currency, fractionDigits, number) {
        var formatted = new Intl.NumberFormat(locales, {
          style: 'currency',
          currency: currency,
          minimumFractionDigits: fractionDigits
        }).format(number);
        return formatted;
      }
      async bycat({request, response,params, view})
      {
        //console.log(request.params.id)
        const category = await Category.find(params.id)
        const categories = await Category.all()
        const products = await Product.query().where("father","=",category.name).fetch()
        
        var products2 = []

        var categories2 = await Product.query().pluck('father').groupBy('father')
        for(const product of products.toJSON())
        {
            product.price=this.formatCurrency("es-CO", "COP", 0, product.price);
            products2.push(product)
            
        }
        console.log(categories.toJSON());
        console.log(categories2)
        return view.render('products_list', { products: products2, category: category, categories: categories2 })
      }

      async bycatmenu({request, response,params, view})
      {
        //console.log(request.params.name.replace(/%20/g, ' '))
        const products = await Product.query().where("category","LIKE",request.params.name.replace(/%20/g, ' ')).fetch()
        var products2=[]
        for(const product of products.toJSON())
        {
            product.price=this.formatCurrency("es-CO", "COP", 0, product.price);
            products2.push(product)
        }
        const category = await Category.query().where("name", "LIKE", request.params.name.replace(/%20/g, ' ')).first();
        //const category = await Category.find(params.id)
        console.log(category)
        const categories = await Category.all()
        
        var categories2 = await Product.query().pluck('father').groupBy('father')
        return view.render('products_list', { products: products2, category: category, categories: categories2 })
      }

      async search({request, response,params, view})
      {
        var products=[]
        var products2=[]
        var category=[]
      
        var sortparam="asc"
        var sortname="name"
        
        if(request.get().sort)
        {
          switch (request.get().sort) {
            case "pricedesc":
              sortparam="desc"
              sortname="price"
            break;
            case "priceasc":
              sortparam="asc"
              sortname="price"
            break;
            case "alphadesc":
              sortparam="desc"
              sortname="name"
            break;
            case "alphaasc":
              sortparam="asc"
              sortname="name"
            break;   
            default:
              sortparam="asc"
              sortname="name"
              break;
          }
          products= await Product.query().orderBy(sortname,sortparam).fetch()
        }

        if(request.get().name)//Busqueda por nombre
        {
          products= await Product.query().where("name","LIKE","%"+request.get().name+"%").orderBy(sortname,sortparam).fetch()
          category.name="Busqueda"
          
        }else//Busqueda por categoria y precio
        {
          (request.get().prices === undefined) ? request.get().prices = 0 : request.get().prices = request.get().prices;
          if(request.get().prices && request.get().category)
          {
            switch (parseInt(request.get().prices)) {
              case 1:
                products=await Product.query().where('category', request.get().category).whereBetween('price',[0,10000]).orderBy(sortname, sortparam).fetch()
                break;
              case 2:
                products=await Product.query().where('category', request.get().category).whereBetween('price',[10000,30000]).orderBy(sortname, sortparam).fetch()
                break;
              case 3:
                products=await Product.query().where('category', request.get().category).whereBetween('price',[30000,50000]).orderBy(sortname, sortparam).fetch()
                break;
              case 4:
                products=await Product.query().where('category', request.get().category).whereBetween('price',">",50000).orderBy(sortname, sortparam).fetch()
                break;
              default:
                products=await Product.query().where('category', request.get().category).orderBy(sortname, sortparam).fetch()
                break;
            }
          }else
          {
            if(request.get().prices)
            {
              switch (parseInt(request.get().prices)) {
                case 1:
                  products=await Product.query().whereBetween('price',[0,10000]).orderBy(sortname, sortparam).fetch()
                  break;
                case 2:
                  products=await Product.query().whereBetween('price',[10000,30000]).orderBy(sortname, sortparam).fetch()
                  break;
                case 3:
                  products=await Product.query().whereBetween('price',[30000,50000]).orderBy(sortname, sortparam).fetch()
                  break;
                case 4:
                  products=await Product.query().whereBetween('price',">",50000).orderBy(sortname, sortparam).fetch()
                  break;
                default:
                  products=Product.all().fetch()
                  break;
              }
            }
            if(request.get().category)
            {
              products = await Product.query().where("category","like",request.get().category).fetch();
            }
          }
        }
        let father = "";
        for(const product of products.toJSON())
        {
          father = product.father;
          product.price=this.formatCurrency("es-CO", "COP", 0, product.price);
          products2.push(product)
        }


        
        const categories2 = await Product.query().where("father",father).pluck('category').groupBy('category')
        const categories = await Category.all()
        return view.render('products_list', { products: products2, category: category, categories: categories2 })
      }
      
      async cart({request, response, view})
      {        
        return view.render("cart");
      }

      async get({request, response, params})
      {
        const id=request.input("id");
        //console.log("llegó: "+id)
        const product=await Product.find(id)
        product.price2=this.formatCurrency("es-CO", "COP", 0, product.price);
        
        var product2={}
        product2.id=product.id
        product2.name=product.name
        product2.code=product.code
        product2.category=product.category
        product2.price=product.price
        product2.short_description=product.short_description
        product2.long_description=product.long_description

        const axios = use('axios');        
        /*await axios.get(product.image)
        .then( (response) => {
            
            product.image="https://boutiqueathenea.co/"+product.id+".png"
            product2.image="https://boutiqueathenea.co/"+product.id+".png"
        }).catch((error) =>{
            
            product.image="https://boutiqueathenea.co/placeholder.png"
            product2.image="https://boutiqueathenea.co/placeholder.png"
            
          })
          */
          
          
          
        return product
      }
      
      async checkout({request, response, view})
      {
        var cart=request.input("CART")
        const originalcart=cart
        cart=JSON.parse(cart)
        var products=[]
        var total=0
        for(const cart2 of cart.cart)
        {
          const product=await Product.findOrFail(parseInt(cart2.Product))
          var carrito={}
          carrito.id=product.id
          carrito.name=product.name
          carrito.code=product.code
          carrito.quantity=cart2.Quantity
          carrito.price=parseInt(carrito.quantity)*parseInt(product.price)
          carrito.prettyprice=this.formatCurrency("es-CO", "COP", 0, carrito.price)
          total=total+parseInt(carrito.price)
          products.push(carrito)
        }
        var prettyprices={}
        prettyprices.subtotal=this.formatCurrency("es-CO", "COP", 0,total)
        prettyprices.shipping=this.formatCurrency("es-CO", "COP", 0, 0)
        prettyprices.total=this.formatCurrency("es-CO", "COP", 0,total+0)

        var prices={}
        prices.subtotal=prices.subtotal+total
        prices.shipping= 0
        prices.total=prices.subtotal+prices.shipping
        
        return view.render("checkout", {cart: products, prices: prices, prettyprices:prettyprices, originalcart: originalcart});
      }
      async pay({request, response, view})
      {
        //registrar al cliente si no existe
        //si existe actualizar sus datos
        //registrar la orden en la bd

        //Recibo datos de cliente y datos de la orden
        const email=request.input("EMAIL")
        
        try{
          //Cliente existe y se actualizan sus valores
          var client=await Client.findBy("email",email)
          var client2 = await Client.find(client.id)
          client2.name=request.input("NAME")
          client2.phone=request.input("PHONE")
          client2.address=request.input("ADDRESS")
          client2.city=request.input("CITY")
          client2.country=request.input("COUNTRY")
          await client2.save()
          console.log("Actualizando cliente")
        }catch(e)
        {
          //Cliente no existe y pasa a ser creado
          var client = await new Client()
          client.name=request.input("NAME")
          client.email=email
          client.phone=request.input("PHONE")
          client.address=request.input("ADDRESS")
          client.city=request.input("CITY")
          client.country=request.input("COUNTRY")
          await client.save()
          console.log("Creado cliente nuevo")          
        }

        var cart=request.input("CART")
        cart=JSON.parse(cart)
        var products=[]
        var total=0

        const order= await new Order()
        order.client_id=client.id
        order.status="pending"
        order.value=0
        await order.save()
        console.log("Creada Orden")
        var prods="";
        for(const cart2 of cart.cart)
        {
          const orderProduct=await new OrderProduct()
          const product=await Product.findOrFail(parseInt(cart2.Product))
          orderProduct.order_id=order.id
          orderProduct.product_id=product.id
          orderProduct.quantity=cart2.Quantity
          prods+=product.name+": $"+product.price+" x"+orderProduct.quantity+" - "
          order.value=parseInt(order.value)+parseInt(product.price)*parseInt(cart2.Quantity)
          await orderProduct.save()
          console.log("Agregado producto a Orden")
        }
        prods+=" Total: $"+order.value
        
        console.log("Proceso completo")

        const Mail = use('Mail')
        console.log(order.toJSON())
        await Mail.send('emails.order', {order: order.toJSON(), prods: prods}, (message) => {
          message
            .to(email)
            .from('no-reply@boutiqueathenea.co')
            .subject('Confirmación de pedido')
            console.log("Enviado Correo")
        })

        const axios = require('axios');
        var FormData = require('form-data');

        var bodyFormData = new FormData();
        bodyFormData.append('userName', 'CLARITZA_MARIA-api');
        bodyFormData.append('password', 'CLARITZA_MARIA');
        bodyFormData.append('orderNumber', order.id);
        bodyFormData.append('amount',  order.value+"00");
        bodyFormData.append('returnUrl', "https://boutiqueathenea.co/pay");
        bodyFormData.append('description', prods);

        await axios({
          method: 'post',
          url: 'https://ecouat.credibanco.com/payment/rest/register.do',
          data: bodyFormData,
          headers: {
            'content-type': `multipart/form-data; boundary=${bodyFormData._boundary}`,
            }
        })
        .then(function (res) {
          console.log("Pasarela");
          order.gateway=res.data.orderId
          order.save()
          return response.redirect(res.data.formUrl)
        })
        .catch(function (error) {
          console.log("Error"+error);
          return response.redirect("https://boutiqueathenea.co")
        });
        //return view.render('order_completed')
      }
      async pay2({request, response, view})
      {
        return view.render('order_completed')
      }
}
module.exports = ProductController