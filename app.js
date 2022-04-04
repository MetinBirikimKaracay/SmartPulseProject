const api = require('axios')

let today = new Date()
let dd = String(today.getDate()).padStart(2, '0')
let mm = String(today.getMonth() + 1).padStart(2, '0')
let yyyy = today.getFullYear()

today = yyyy + '-' + mm + '-' + dd

api.get('https://seffaflik.epias.com.tr/transparency/service/market/intra-day-trade-history', {
    params: {
        endDate: today,
        startDate: today
    }
})
    .then(function (response) {
        let data = response.data.body.intraDayTradeHistoryList.filter(function (a) {
            if (a.conract.startsWith("PH")) {
                return true
            }
        });

        let groupConract = data.reduce((result, item) => {
            (result[item.conract] = result[item.conract] || []).push(item)
            return result
        })

        let items = [];
        let itemsProp = [];

        let day = new Date().getDate()

        //Kayıt Sayısını bulmak ve elimizde olmayan verileri belirlemek için oluşturduğumuz yapı
        let summary = 0
        for (let i =day; i < (day+1); i++) {
            for (let j = 0; j < 24; j++) {
                if (j < 10) {
                    if (groupConract["PH22040" + i + "0" + j] == undefined) {

                        console.log("Böyle Bir kayıt bulunamadı : PH22040" + i + "0" + j + "")
                    }
                    else {
                        items.push({
                            key: ["PH22040" + i + "0" + j],
                            value: groupConract["PH22040" + i + "0" + j].length
                        });
                        summary += groupConract["PH22040" + i + "0" + j].length
                    }
                }
                else if (j > 9 && j < 20) {
                    if (groupConract["PH22040" + i + "" + j] == undefined) {

                        console.log("Böyle Bir kayıt bulunamadı : PH22040" + i + "1" + j + "")
                    }
                    else {
                        items.push({
                            key: ["PH22040" + i + "" + j],
                            value: groupConract["PH22040" + i + "" + j].length
                        });
                        summary += groupConract["PH22040" + i + "" + j].length
                    }
                }
                else if (j > 19) {
                    if (groupConract["PH22040" + i + "" + j] == undefined) {

                        console.log("Böyle Bir kayıt bulunamadı : PH22040" + i + "" + j + "")
                    }
                    else {
                        items.push({
                            key: ["PH22040" + i + "" + j],
                            value: groupConract["PH22040" + i + "" + j].length
                        });
                        summary += groupConract["PH22040" + i + "" + j].length
                    }
                }
            }
        }
        console.log("Toplam Veri Sayısı : "+summary)


        for (let i = 0; i < items.length; i++) {
            let toplamIslemTutari = 0
            let toplamIslemMiktari = 0
            let agirlikliOrtalamaFiyat = 0
            let priceSum = 0
            let quanSum = 0

            for (let j = 0; j < groupConract[items[i].key].length; j++) {
                if (groupConract[items[i].key][j]) {

                    //İstenen değerleri hesapladık
                    toplamIslemTutari += ((groupConract[items[i].key][j].price) * (groupConract[items[i].key][j].quantity)) / 10
                    toplamIslemMiktari += (groupConract[items[i].key][j].quantity / 10)

                    //Mevcut conract'ın price ve quantity verilerinin toplamı
                    priceSum += groupConract[items[i].key][j].price
                    quanSum += groupConract[items[i].key][j].quantity

                } else {
                    priceSum += 0
                }

            }
            // Ağırlıklı Ortalama Fiyatı Hesaplama
            agirlikliOrtalamaFiyat = toplamIslemTutari / toplamIslemMiktari

            // Tarihi Oluşturma
            dd = items[i].key[0].substring(6, 8)
            mm = items[i].key[0].substring(4, 6)
            yyyy = items[i].key[0].substring(2, 4)
            let hh = items[i].key[0].substring(8, 10)

            // İşlem yaptığımız conract ile ilgili değerleri dictionary yapısında saklıyoruz
            itemsProp.push({
                conract: [groupConract[items[i].key][0].conract],
                price: priceSum,
                quantity: quanSum,
                toplamIslemTutari: toplamIslemTutari,
                toplamIslemMiktari: toplamIslemMiktari,
                agirlikliOrtalamaFiyat: agirlikliOrtalamaFiyat,
                tarih: `${dd}.${mm}.20${yyyy} ${hh}:00` // Oluşturduğum tarih bilgisini uygun formata çevirdik
            });

        }

        //Conract'ları gruplandırıp, Toplam İşlem Tutarı, Toplam İşlem Miktarı ve Ağırlıklı Ortalama Fiyat özelliklerini 
        //tablolamaya hazır hale getirdik
        console.log(itemsProp)

    })
    .catch(function (error) {
        console.log(error)
    })