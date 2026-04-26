const BaseError = require("../../../errors/base.error");
const moment = require("moment");
const mongoose = require("mongoose");

class StatisticsService {
    /**
     * Dashboard statistikasi
     */
    async GetDashboardStats(req) {
        const { Cart } = req.tenantModels;
        const { period = 'Hafta', startDate, endDate } = req.query;
        
        // Sanalar oralig'ini aniqlash (Maxsus sana yoki period bo'yicha)
        const { start, end } = this._getDateRange(period, startDate, endDate);

        try {
            const summary = await Cart.aggregate([
                {
                    $match: {
                        createdAt: { $gte: start, $lte: end },
                        status: 'completed'
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: { $ifNull: ["$finalTotal", 0] } },
                        totalOrders: { $count: {} },
                        cash: {
                            $sum: {
                                $sum: {
                                    $map: {
                                        input: "$payments",
                                        as: "p",
                                        in: { $cond: [{ $eq: ["$$p.type", "cash"] }, "$$p.amount", 0] }
                                    }
                                }
                            }
                        },
                        card: {
                            $sum: {
                                $sum: {
                                    $map: {
                                        input: "$payments",
                                        as: "p",
                                        in: { $cond: [{ $eq: ["$$p.type", "card"] }, "$$p.amount", 0] }
                                    }
                                }
                            }
                        },
                        debt: {
                            $sum: {
                                $sum: {
                                    $map: {
                                        input: "$payments",
                                        as: "p",
                                        in: { $cond: [{ $eq: ["$$p.type", "debt"] }, "$$p.amount", 0] }
                                    }
                                }
                            }
                        },
                        balance: {
                            $sum: {
                                $sum: {
                                    $map: {
                                        input: "$payments",
                                        as: "p",
                                        in: { $cond: [{ $eq: ["$$p.type", "balance"] }, "$$p.amount", 0] }
                                    }
                                }
                            }
                        }
                    }
                }
            ]);

            const s = summary[0] || {};
            const totalRevenue = s.totalRevenue || 0;
            const totalOrders = s.totalOrders || 0;

            const chartDataRaw = await this._getChartData(req, period, start, end);

            return {
                success: true,
                msg: startDate ? "Belgilangan davr statistikasi yuklandi" : `${period}lik statistika yuklandi`,
                data: {
                    totalRevenue,
                    totalOrders,
                    averageCheck: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
                    payments: [
                        { label: 'Naqd', value: s.cash || 0 },
                        { label: 'Karta', value: s.card || 0 },
                        { label: 'Nasiya', value: s.debt || 0 },
                        { label: 'Depozit', value: s.balance || 0 }
                    ],
                    chartData: this._formatChartForUI(chartDataRaw, period, !!startDate)
                }
            };
        } catch (error) {
            console.error("Dashboard Error:", error);
            throw new BaseError("Statistika hisoblashda xatolik yuz berdi", 500);
        }
    }

    /**
     * Top Mijozlar (Sana filtrini qo'shdik)
     */
    async GetTopCustomers(req) {
        const { Cart } = req.tenantModels;
        const { period = 'Hafta', startDate, endDate, limit = 10 } = req.query;
        const { start, end } = this._getDateRange(period, startDate, endDate);

        try {
            const data = await Cart.aggregate([
                { 
                    $match: { 
                        createdAt: { $gte: start, $lte: end }, // Sana filtri
                        status: 'completed', 
                        customerId: { $ne: null } 
                    } 
                },
                {
                    $group: {
                        _id: "$customerId",
                        totalSpent: { $sum: "$finalTotal" },
                        orderCount: { $count: {} }
                    }
                },
                {
                    $lookup: {
                        from: "customers",
                        localField: "_id",
                        foreignField: "_id",
                        as: "customerInfo"
                    }
                },
                { $unwind: { path: "$customerInfo", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 1,
                        totalSpent: 1,
                        orderCount: 1,
                        name: { $ifNull: ["$customerInfo.name", "Noma'lum mijoz"] },
                        phone: "$customerInfo.phone"
                    }
                },
                { $sort: { totalSpent: -1 } },
                { $limit: parseInt(limit) }
            ]);

            return { success: true, data };
        } catch (error) {
            throw new BaseError("Mijozlar tahlilida xatolik", 500);
        }
    }

    /**
     * Top Sotuvlar (Sana filtrini qo'shdik)
     */
    async GetTopSales(req) {
        const { Cart } = req.tenantModels;
        const { period = 'Hafta', startDate, endDate, limit = 5 } = req.query;
        const { start, end } = this._getDateRange(period, startDate, endDate);

        try {
            const data = await Cart.aggregate([
                { 
                    $match: { 
                        createdAt: { $gte: start, $lte: end }, // Sana filtri
                        status: 'completed' 
                    } 
                },
                { $unwind: "$items" },
                {
                    $group: {
                        _id: "$items.foodId",
                        name: { $first: "$items.name" },
                        totalSold: { $sum: "$items.quantity" },
                        revenue: { $sum: "$items.totalPrice" }
                    }
                },
                { $sort: { totalSold: -1 } },
                { $limit: parseInt(limit) }
            ]);

            return { success: true, data };
        } catch (error) {
            throw new BaseError("Mahsulotlar tahlilida xatolik", 500);
        }
    }

    // --- Private Methods ---

    async _getChartData(req, period, start, end) {
        const { Cart } = req.tenantModels;
        let groupId;
        
        // Agar maxsus range tanlangan bo'lsa, avtomatik kunlar bo'yicha guruhlaymiz
        if (req.query.startDate) {
            groupId = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        } else {
            switch (period) {
                case 'Kun': groupId = { $hour: "$createdAt" }; break;
                case 'Yil': groupId = { $month: "$createdAt" }; break;
                case 'Oy': groupId = { $dayOfMonth: "$createdAt" }; break;
                default: groupId = { $dayOfWeek: "$createdAt" }; 
            }
        }

        return await Cart.aggregate([
            { $match: { createdAt: { $gte: start, $lte: end }, status: 'completed' } },
            {
                $group: {
                    _id: groupId,
                    value: { $sum: "$finalTotal" },
                    label: { $first: "$createdAt" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);
    }

    _formatChartForUI(data, period, isCustomRange) {
        if (!data || data.length === 0) return [];
        const maxValue = Math.max(...data.map(d => d.value), 1);
        
        return data.map(item => {
            const date = moment(item.label);
            let label;
            
            if (isCustomRange) {
                label = date.format('DD.MM');
            } else {
                label = period === 'Kun' ? date.format('HH:00') : 
                        period === 'Hafta' ? date.format('ddd') :
                        period === 'Oy' ? date.format('DD.MM') : date.format('MMM');
            }

            return { 
                label, 
                value: item.value, 
                percent: Math.round((item.value / maxValue) * 100) 
            };
        });
    }

    _getDateRange(period, startDate, endDate) {
        // Agar startDate va endDate kelgan bo'lsa, ulardan foydalanamiz
        if (startDate && endDate) {
            return {
                start: moment(startDate).startOf('day').toDate(),
                end: moment(endDate).endOf('day').toDate()
            };
        }

        const end = moment().endOf('day').toDate();
        let start;
        switch (period) {
            case 'Kun': start = moment().startOf('day').toDate(); break;
            case 'Hafta': start = moment().subtract(6, 'days').startOf('day').toDate(); break; 
            case 'Oy': start = moment().startOf('month').toDate(); break;
            case 'Yil': start = moment().startOf('year').toDate(); break;
            default: start = moment().subtract(6, 'days').startOf('day').toDate();
        }
        return { start, end };
    }

   async GetHomeStats(req) {
  try {
    const { Cart } = req.tenantModels;
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));

    // 1. Asosiy statistika (Bugungi yopilgan va barcha faol buyurtmalar)
    const [closedCount, activeCount] = await Promise.all([
      Cart.countDocuments({ 
        status: 'completed', 
        createdAt: { $gte: startOfDay } 
      }),
      Cart.countDocuments({ 
        status: { $in: ['pending', 'preparing', 'ready'] } 
      })
    ]);

    // 2. Top Ofitsiantlar (Employee modeli bilan bog'langan)
    const topStaff = await Cart.aggregate([
      { 
        $match: { 
          createdAt: { $gte: startOfDay }, 
          staffId: { $ne: null } // staffId bor buyurtmalarni olish
        } 
      },
      { 
        $group: { 
          _id: "$staffId", 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: 'employees', // Employee modelining bazadagi nomi
          localField: '_id',
          foreignField: '_id',
          as: 'employeeInfo'
        }
      },
      { $unwind: "$employeeInfo" },
      {
        $project: {
          _id: 0,
          name: "$employeeInfo.firstname",
          orders: "$count"
        }
      }
    ]);

    // 3. Top Taomlar (Menu modeli bilan bog'langan)
    const topDishes = await Cart.aggregate([
      { $match: { createdAt: { $gte: startOfDay } } },
      { $unwind: "$items" },
      { 
        $group: { 
          _id: "$items.foodId", // Schemaingizda 'foodId' ishlatilgan
          name: { $first: "$items.name" },
          count: { $sum: "$items.quantity" }
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: 'menus', // Menu modelining bazadagi nomi
          localField: '_id',
          foreignField: '_id',
          as: 'menuData'
        }
      },
      { 
        $unwind: { 
          path: "$menuData", 
          preserveNullAndEmptyArrays: true 
        } 
      },
      {
        $project: {
          _id: 0,
          name: 1,
          count: 1,
          // Menu modelidagi haqiqiy rasm, agar bo'lmasa null qaytadi
          image: "$menuData.image" 
        }
      }
    ]);

    return {
      success: true,
      data: {
        stats: { 
          closedCount, 
          activeCount,
          growth: 12 // Bu yerda mantiqiy o'sish foizini qo'shishingiz mumkin
        },
        topStaff,
        topDishes
      }
    };

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return {
      success: false,
      message: "Statistika yuklanmadi",
      error: error.message
    };
  }
}
}

module.exports = new StatisticsService();