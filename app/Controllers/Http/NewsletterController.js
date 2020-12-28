'use strict'
const Newsletter = use('App/Models/Newsletter')
const Coupon = use('App/Models/Coupon')
class NewsletterController {
    async store({request, response})
    {
        try{
            const userData = request.only(['email', 'first_name', 'last_name', 'phone'])
            var newsletter = await  Newsletter.create(userData);

            let random_code = Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(2, 6);
            
            var coupon = await Coupon.create({code: random_code, discount: 10, status: "active"});
            
            const Mail = use('Mail')
            await Mail.send('emails.coupon', {coupon: coupon.toJSON()}, (message) => {
            message
                .to(newsletter.email)
                .from('no-reply@boutiqueathenea.co')
                .subject('Registro en Newsletter')
                console.log("Enviado Correo")
            })

        }catch(e)
        {
            return "<script>window.alert('Usted ya se encuentra registrado en el newsletter');window.location.href = '/'</script>";
        }
        return "<script>window.alert('Gracias por registrarse en nuestro newsletter, se ha enviado un cupón de descuento a su correo electrónico');window.location.href = '/'</script>";
    }
}

module.exports = NewsletterController
