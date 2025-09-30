

export default function (month: number,year: number): string {
    let start = "o.date_delivered "
    switch (month) {
        case 1:
            return start+`BETWEEN '${year}-01-01' and '${year}-02-01'`
        case 2:
            return start+`BETWEEN '${year}-02-01' and '${year}-03-01'`
        case 3:
            return start+`BETWEEN '${year}-03-01' and '${year}-04-01'`
        case 4:
            return start+`BETWEEN '${year}-04-01' and '${year}-05-01'`
        case 5:
            return start+`BETWEEN '${year}-05-01' and '${year}-06-01'`
        case 6:
            return start+`BETWEEN '${year}-06-01' and '${year}-07-01'`
        case 7:
            return start+`BETWEEN '${year}-07-01' and '${year}-08-01'`
        case 8:
            return start+`BETWEEN '${year}-08-01' and '${year}-09-01'`
        case 9:
            return start+`BETWEEN '${year}-09-01' and '${year}-10-01'`
        case 10:
            return start+`BETWEEN '${year}-10-01' and '${year}-11-01'`
        case 11:
            return start+`BETWEEN '${year}-11-01' and '${year}-12-01'`
        case 12:
            return start+`BETWEEN '${year}-12-01' and '${year + 1}-01-01'`
        default:
            return start+`BETWEEN '2099-12-29' and '2099-12-30'`
    }
}