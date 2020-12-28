'use strict'
const Coupon = use('App/Models/Coupon')
class CouponController {
    async validate({request, view})
    {
        var coupon = await Coupon.query().where("code", request.get().code).andWhere("status","=", "active").firstOrFail();
        return coupon
    }
}

module.exports = CouponController