interface IEndCode {
  month: string,
  year: string
}
export default function (): IEndCode {
  const currentDate = new Date()
  const end: IEndCode = {
    month: '',
    year: ''
  }
  switch(currentDate.getMonth()){
    case 0:
      end.month = 'EN'
      break;
    case 1:
      end.month = 'FE'
      break;
    case 2:
      end.month = 'MA'
      break;
    case 3:
      end.month = 'AB'
      break;
    case 4:
      end.month = 'MY'
      break;
    case 5: 
      end.month = 'JN'
      break;
    case 6:
      end.month = 'JL'
      break;
    case 7:
      end.month = 'AG'
      break;
    case 8:
      end.month = 'SE'
      break;
    case 9:
      end.month = 'OC'
      break;
    case 10:
      end.month = 'NO'
      break;
    case 11:
      end.month = 'DI'
      break;
    default:
      end.month = 'ZU'
  }
  end.year += new Date().getFullYear() - 2000  
  return end
}