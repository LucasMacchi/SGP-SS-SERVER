    export default function fillEmpty (data: string, total: number, all: boolean, string: boolean, ceros: boolean): string {
        if(all){
            let newStr = ""
            for (let index = 1; index <= total; index++) {
                newStr = " "+newStr
            }
            return newStr
        }
        else {
            if(data.length === total) return data
            else {
                let newStr = data
                const diff = total - data.length
                //console.log("LENGTH: "+data.length+"/ TOTAL: "+total+"/ DATA: "+data)
                for (let index = 1; index <= diff; index++) {
                    if(string) newStr = newStr + " "
                    else if(ceros) newStr = "0"+newStr
                    else newStr = " "+newStr
                }
                return newStr
            }
        }

    }