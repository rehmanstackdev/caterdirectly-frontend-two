
// Tax calculation utilities
export interface TaxData {
  rate: number;
  description: string;
  jurisdiction: string;
}

// Bay Area ZIP codes with their tax rates, cities, and counties
const BAY_AREA_TAX_RATES: Record<string, { rate: number; city: string; county: string }> = {
  // San Francisco County
  "94102": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94103": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94104": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94105": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94106": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94107": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94108": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94109": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94110": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94111": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94112": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94113": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94114": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94115": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94116": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94117": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94118": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94119": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94120": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94121": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94122": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94123": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94124": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94125": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94126": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94127": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94128": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94129": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94130": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94131": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94132": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94133": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94134": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94137": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94138": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94139": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94140": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94141": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94142": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94143": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94144": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94145": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94146": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94147": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94151": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94158": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94159": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94160": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94161": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94163": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94164": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94172": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94177": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  "94188": { rate: 0.0863, city: "San Francisco", county: "San Francisco" },
  
  // Alameda County
  "94501": { rate: 0.1025, city: "Alameda", county: "Alameda" },
  "94502": { rate: 0.1025, city: "Alameda", county: "Alameda" },
  "94536": { rate: 0.1075, city: "Fremont", county: "Alameda" },
  "94537": { rate: 0.1075, city: "Fremont", county: "Alameda" },
  "94538": { rate: 0.1075, city: "Fremont", county: "Alameda" },
  "94539": { rate: 0.1075, city: "Fremont", county: "Alameda" },
  "94541": { rate: 0.1025, city: "Hayward", county: "Alameda" },
  "94542": { rate: 0.1025, city: "Hayward", county: "Alameda" },
  "94544": { rate: 0.1025, city: "Hayward", county: "Alameda" },
  "94545": { rate: 0.1025, city: "Hayward", county: "Alameda" },
  "94546": { rate: 0.0975, city: "Castro Valley", county: "Alameda" },
  "94550": { rate: 0.1025, city: "Livermore", county: "Alameda" },
  "94551": { rate: 0.1025, city: "Livermore", county: "Alameda" },
  "94552": { rate: 0.0975, city: "Castro Valley", county: "Alameda" },
  "94555": { rate: 0.0975, city: "Fremont", county: "Alameda" },
  "94560": { rate: 0.0975, city: "Newark", county: "Alameda" },
  "94566": { rate: 0.1025, city: "Pleasanton", county: "Alameda" },
  "94568": { rate: 0.1025, city: "Dublin", county: "Alameda" },
  "94577": { rate: 0.1025, city: "San Leandro", county: "Alameda" },
  "94578": { rate: 0.1025, city: "San Leandro", county: "Alameda" },
  "94579": { rate: 0.1025, city: "San Leandro", county: "Alameda" },
  "94580": { rate: 0.0975, city: "San Lorenzo", county: "Alameda" },
  "94586": { rate: 0.0975, city: "Sunol", county: "Alameda" },
  "94587": { rate: 0.0975, city: "Union City", county: "Alameda" },
  "94588": { rate: 0.1025, city: "Pleasanton", county: "Alameda" },
  "94601": { rate: 0.1075, city: "Oakland", county: "Alameda" },
  "94602": { rate: 0.1075, city: "Oakland", county: "Alameda" },
  "94603": { rate: 0.1075, city: "Oakland", county: "Alameda" },
  "94605": { rate: 0.1075, city: "Oakland", county: "Alameda" },
  "94606": { rate: 0.1075, city: "Oakland", county: "Alameda" },
  "94607": { rate: 0.1075, city: "Oakland", county: "Alameda" },
  "94608": { rate: 0.1075, city: "Oakland", county: "Alameda" },
  "94609": { rate: 0.1075, city: "Oakland", county: "Alameda" },
  "94610": { rate: 0.1075, city: "Oakland", county: "Alameda" },
  "94611": { rate: 0.1075, city: "Oakland", county: "Alameda" },
  "94612": { rate: 0.1075, city: "Oakland", county: "Alameda" },
  "94613": { rate: 0.1075, city: "Oakland", county: "Alameda" },
  "94618": { rate: 0.1075, city: "Oakland", county: "Alameda" },
  "94619": { rate: 0.1075, city: "Oakland", county: "Alameda" },
  "94620": { rate: 0.1075, city: "Oakland", county: "Alameda" },
  "94621": { rate: 0.1075, city: "Oakland", county: "Alameda" },
  "94622": { rate: 0.1075, city: "Oakland", county: "Alameda" },
  "94623": { rate: 0.1075, city: "Oakland", county: "Alameda" },
  "94624": { rate: 0.1075, city: "Oakland", county: "Alameda" },
  "94649": { rate: 0.1075, city: "Oakland", county: "Alameda" },
  "94660": { rate: 0.1075, city: "Oakland", county: "Alameda" },
  "94661": { rate: 0.1075, city: "Oakland", county: "Alameda" },
  "94662": { rate: 0.1075, city: "Oakland", county: "Alameda" },
  "94666": { rate: 0.1075, city: "Oakland", county: "Alameda" },
  "94701": { rate: 0.1025, city: "Berkeley", county: "Alameda" },
  "94702": { rate: 0.1025, city: "Berkeley", county: "Alameda" },
  "94703": { rate: 0.1025, city: "Berkeley", county: "Alameda" },
  "94704": { rate: 0.1025, city: "Berkeley", county: "Alameda" },
  "94705": { rate: 0.1025, city: "Berkeley", county: "Alameda" },
  "94706": { rate: 0.1025, city: "Albany", county: "Alameda" },
  "94707": { rate: 0.1025, city: "Berkeley", county: "Alameda" },
  "94708": { rate: 0.1025, city: "Berkeley", county: "Alameda" },
  "94709": { rate: 0.1025, city: "Berkeley", county: "Alameda" },
  "94710": { rate: 0.1025, city: "Berkeley", county: "Alameda" },
  "94720": { rate: 0.1025, city: "Berkeley", county: "Alameda" },
  
  // Contra Costa County
  "94505": { rate: 0.0875, city: "Discovery Bay", county: "Contra Costa" },
  "94506": { rate: 0.0875, city: "Danville", county: "Contra Costa" },
  "94507": { rate: 0.0875, city: "Alamo", county: "Contra Costa" },
  "94509": { rate: 0.0875, city: "Antioch", county: "Contra Costa" },
  "94511": { rate: 0.0875, city: "Atherton", county: "Contra Costa" },
  "94513": { rate: 0.0875, city: "Brentwood", county: "Contra Costa" },
  "94516": { rate: 0.0875, city: "Canyon", county: "Contra Costa" },
  "94517": { rate: 0.0875, city: "Clayton", county: "Contra Costa" },
  "94518": { rate: 0.0875, city: "Concord", county: "Contra Costa" },
  "94519": { rate: 0.0875, city: "Concord", county: "Contra Costa" },
  "94520": { rate: 0.0875, city: "Concord", county: "Contra Costa" },
  "94521": { rate: 0.0875, city: "Concord", county: "Contra Costa" },
  "94522": { rate: 0.0875, city: "Concord", county: "Contra Costa" },
  "94523": { rate: 0.0875, city: "Pleasant Hill", county: "Contra Costa" },
  "94524": { rate: 0.0875, city: "Concord", county: "Contra Costa" },
  "94525": { rate: 0.0875, city: "Clayton", county: "Contra Costa" },
  "94526": { rate: 0.0875, city: "Danville", county: "Contra Costa" },
  "94527": { rate: 0.0875, city: "Diablo", county: "Contra Costa" },
  "94528": { rate: 0.0875, city: "Diablo", county: "Contra Costa" },
  "94529": { rate: 0.0875, city: "Concord", county: "Contra Costa" },
  "94530": { rate: 0.0875, city: "El Cerrito", county: "Contra Costa" },
  "94531": { rate: 0.0875, city: "Greenbrae", county: "Contra Costa" },
  "94547": { rate: 0.0875, city: "Hercules", county: "Contra Costa" },
  "94548": { rate: 0.0875, city: "Knightsen", county: "Contra Costa" },
  "94549": { rate: 0.0875, city: "Lafayette", county: "Contra Costa" },
  "94553": { rate: 0.0875, city: "Martinez", county: "Contra Costa" },
  "94556": { rate: 0.0875, city: "Moraga", county: "Contra Costa" },
  "94561": { rate: 0.0875, city: "Oakley", county: "Contra Costa" },
  "94563": { rate: 0.0875, city: "Orinda", county: "Contra Costa" },
  "94564": { rate: 0.0875, city: "Pinole", county: "Contra Costa" },
  "94565": { rate: 0.0875, city: "Pittsburg", county: "Contra Costa" },
  "94569": { rate: 0.0875, city: "San Ramon", county: "Contra Costa" },
  "94572": { rate: 0.0875, city: "Rodeo", county: "Contra Costa" },
  "94575": { rate: 0.0875, city: "San Ramon", county: "Contra Costa" },
  "94583": { rate: 0.0875, city: "San Ramon", county: "Contra Costa" },
  "94595": { rate: 0.0875, city: "Walnut Creek", county: "Contra Costa" },
  "94596": { rate: 0.0875, city: "Walnut Creek", county: "Contra Costa" },
  "94597": { rate: 0.0875, city: "Walnut Creek", county: "Contra Costa" },
  "94598": { rate: 0.0875, city: "Walnut Creek", county: "Contra Costa" },
  "94801": { rate: 0.0875, city: "Richmond", county: "Contra Costa" },
  "94802": { rate: 0.0875, city: "Richmond", county: "Contra Costa" },
  "94803": { rate: 0.0875, city: "El Sobrante", county: "Contra Costa" },
  "94804": { rate: 0.0875, city: "Richmond", county: "Contra Costa" },
  "94805": { rate: 0.0875, city: "Richmond", county: "Contra Costa" },
  "94806": { rate: 0.0875, city: "San Pablo", county: "Contra Costa" },
  "94807": { rate: 0.0875, city: "Richmond", county: "Contra Costa" },
  "94808": { rate: 0.0875, city: "Richmond", county: "Contra Costa" },
  "94820": { rate: 0.0875, city: "El Cerrito", county: "Contra Costa" },
  "94850": { rate: 0.0875, city: "Crockett", county: "Contra Costa" },
  
  // Marin County
  "94901": { rate: 0.0875, city: "San Rafael", county: "Marin" },
  "94903": { rate: 0.0875, city: "San Rafael", county: "Marin" },
  "94904": { rate: 0.0875, city: "Greenbrae", county: "Marin" },
  "94912": { rate: 0.0875, city: "San Rafael", county: "Marin" },
  "94913": { rate: 0.0875, city: "San Rafael", county: "Marin" },
  "94914": { rate: 0.0875, city: "Greenbrae", county: "Marin" },
  "94915": { rate: 0.0875, city: "San Rafael", county: "Marin" },
  "94920": { rate: 0.0875, city: "Belvedere", county: "Marin" },
  "94924": { rate: 0.0875, city: "Bolinas", county: "Marin" },
  "94925": { rate: 0.0875, city: "Corte Madera", county: "Marin" },
  "94929": { rate: 0.0875, city: "Dillon Beach", county: "Marin" },
  "94930": { rate: 0.0875, city: "Fairfax", county: "Marin" },
  "94933": { rate: 0.0875, city: "Forest Knolls", county: "Marin" },
  "94937": { rate: 0.0875, city: "Inverness", county: "Marin" },
  "94938": { rate: 0.0875, city: "Lagunitas", county: "Marin" },
  "94939": { rate: 0.0875, city: "Larkspur", county: "Marin" },
  "94940": { rate: 0.0875, city: "Marshall", county: "Marin" },
  "94941": { rate: 0.0875, city: "Mill Valley", county: "Marin" },
  "94942": { rate: 0.0875, city: "Mill Valley", county: "Marin" },
  "94945": { rate: 0.0875, city: "Novato", county: "Marin" },
  "94946": { rate: 0.0875, city: "Nicasio", county: "Marin" },
  "94947": { rate: 0.0875, city: "Novato", county: "Marin" },
  "94948": { rate: 0.0875, city: "Novato", county: "Marin" },
  "94949": { rate: 0.0875, city: "Novato", county: "Marin" },
  "94950": { rate: 0.0875, city: "Petaluma", county: "Marin" },
  "94956": { rate: 0.0875, city: "Point Reyes Station", county: "Marin" },
  "94957": { rate: 0.0875, city: "Ross", county: "Marin" },
  "94960": { rate: 0.0875, city: "San Anselmo", county: "Marin" },
  "94963": { rate: 0.0875, city: "San Geronimo", county: "Marin" },
  "94964": { rate: 0.0875, city: "San Geronimo", county: "Marin" },
  "94965": { rate: 0.0875, city: "Sausalito", county: "Marin" },
  "94966": { rate: 0.0875, city: "Sausalito", county: "Marin" },
  "94970": { rate: 0.0875, city: "Stinson Beach", county: "Marin" },
  "94971": { rate: 0.0875, city: "Tomales", county: "Marin" },
  "94973": { rate: 0.0875, city: "Woodacre", county: "Marin" },
  "94974": { rate: 0.0875, city: "San Rafael", county: "Marin" },
  "94975": { rate: 0.0875, city: "San Rafael", county: "Marin" },
  "94976": { rate: 0.0875, city: "San Rafael", county: "Marin" },
  "94977": { rate: 0.0875, city: "Lagunitas", county: "Marin" },
  "94978": { rate: 0.0875, city: "San Anselmo", county: "Marin" },
  "94979": { rate: 0.0875, city: "San Rafael", county: "Marin" },
  
  // Napa County
  "94503": { rate: 0.0875, city: "American Canyon", county: "Napa" },
  "94508": { rate: 0.0875, city: "Angwin", county: "Napa" },
  "94515": { rate: 0.0875, city: "Calistoga", county: "Napa" },
  "94558": { rate: 0.0875, city: "Napa", county: "Napa" },
  "94559": { rate: 0.0875, city: "Napa", county: "Napa" },
  "94562": { rate: 0.0875, city: "Oakville", county: "Napa" },
  "94567": { rate: 0.0875, city: "Pope Valley", county: "Napa" },
  "94573": { rate: 0.0875, city: "Rutherford", county: "Napa" },
  "94574": { rate: 0.0875, city: "St. Helena", county: "Napa" },
  "94581": { rate: 0.0875, city: "Deer Park", county: "Napa" },
  "94599": { rate: 0.0875, city: "Yountville", county: "Napa" },
  
  // San Mateo County
  "94002": { rate: 0.0975, city: "Belmont", county: "San Mateo" },
  "94005": { rate: 0.0975, city: "Brisbane", county: "San Mateo" },
  "94010": { rate: 0.0975, city: "Burlingame", county: "San Mateo" },
  "94011": { rate: 0.0975, city: "Burlingame", county: "San Mateo" },
  "94014": { rate: 0.0975, city: "Daly City", county: "San Mateo" },
  "94015": { rate: 0.0975, city: "Daly City", county: "San Mateo" },
  "94016": { rate: 0.0975, city: "Daly City", county: "San Mateo" },
  "94017": { rate: 0.0975, city: "Daly City", county: "San Mateo" },
  "94018": { rate: 0.0975, city: "Daly City", county: "San Mateo" },
  "94019": { rate: 0.0975, city: "Half Moon Bay", county: "San Mateo" },
  "94020": { rate: 0.0975, city: "Ladera", county: "San Mateo" },
  "94021": { rate: 0.0975, city: "Ladera", county: "San Mateo" },
  "94025": { rate: 0.0975, city: "Menlo Park", county: "San Mateo" },
  "94026": { rate: 0.0975, city: "Menlo Park", county: "San Mateo" },
  "94027": { rate: 0.0975, city: "Atherton", county: "San Mateo" },
  "94028": { rate: 0.0975, city: "Portola Valley", county: "San Mateo" },
  "94030": { rate: 0.0975, city: "Millbrae", county: "San Mateo" },
  "94037": { rate: 0.0975, city: "Montara", county: "San Mateo" },
  "94038": { rate: 0.0975, city: "Moss Beach", county: "San Mateo" },
  "94044": { rate: 0.0975, city: "Pacifica", county: "San Mateo" },
  "94060": { rate: 0.0975, city: "Pescadero", county: "San Mateo" },
  "94061": { rate: 0.0975, city: "Redwood City", county: "San Mateo" },
  "94062": { rate: 0.0975, city: "Woodside", county: "San Mateo" },
  "94063": { rate: 0.0975, city: "Redwood City", county: "San Mateo" },
  "94064": { rate: 0.0975, city: "Redwood City", county: "San Mateo" },
  "94065": { rate: 0.0975, city: "Redwood City", county: "San Mateo" },
  "94066": { rate: 0.0975, city: "San Bruno", county: "San Mateo" },
  "94070": { rate: 0.0975, city: "San Carlos", county: "San Mateo" },
  "94074": { rate: 0.0975, city: "San Gregorio", county: "San Mateo" },
  "94080": { rate: 0.0975, city: "South San Francisco", county: "San Mateo" },
  "94083": { rate: 0.0975, city: "South San Francisco", county: "San Mateo" },
  
  // Santa Clara County
  "94022": { rate: 0.0913, city: "Los Altos", county: "Santa Clara" },
  "94023": { rate: 0.0913, city: "Los Altos", county: "Santa Clara" },
  "94024": { rate: 0.0913, city: "Los Altos", county: "Santa Clara" },
  "94035": { rate: 0.0913, city: "Milpitas", county: "Santa Clara" },
  "94040": { rate: 0.0913, city: "Mountain View", county: "Santa Clara" },
  "94041": { rate: 0.0913, city: "Mountain View", county: "Santa Clara" },
  "94043": { rate: 0.0913, city: "Mountain View", county: "Santa Clara" },
  "94085": { rate: 0.0913, city: "Sunnyvale", county: "Santa Clara" },
  "94086": { rate: 0.0913, city: "Sunnyvale", county: "Santa Clara" },
  "94087": { rate: 0.0913, city: "Sunnyvale", county: "Santa Clara" },
  "94089": { rate: 0.0913, city: "Sunnyvale", county: "Santa Clara" },
  "94301": { rate: 0.0838, city: "Palo Alto", county: "Santa Clara" },
  "94302": { rate: 0.0838, city: "Palo Alto", county: "Santa Clara" },
  "94303": { rate: 0.0838, city: "Palo Alto", county: "Santa Clara" },
  "94304": { rate: 0.0838, city: "Palo Alto", county: "Santa Clara" },
  "94305": { rate: 0.0838, city: "Stanford", county: "Santa Clara" },
  "94306": { rate: 0.0838, city: "Palo Alto", county: "Santa Clara" },
  "95002": { rate: 0.0863, city: "Alviso", county: "Santa Clara" },
  "95008": { rate: 0.0913, city: "Campbell", county: "Santa Clara" },
  "95009": { rate: 0.0913, city: "Campbell", county: "Santa Clara" },
  "95014": { rate: 0.0913, city: "Cupertino", county: "Santa Clara" },
  "95015": { rate: 0.0913, city: "Cupertino", county: "Santa Clara" },
  "95020": { rate: 0.0875, city: "Gilroy", county: "Santa Clara" },
  "95021": { rate: 0.0875, city: "Gilroy", county: "Santa Clara" },
  "95030": { rate: 0.0913, city: "Los Gatos", county: "Santa Clara" },
  "95032": { rate: 0.0913, city: "Los Gatos", county: "Santa Clara" },
  "95033": { rate: 0.0913, city: "Los Gatos", county: "Santa Clara" },
  "95035": { rate: 0.0913, city: "Milpitas", county: "Santa Clara" },
  "95037": { rate: 0.0875, city: "Morgan Hill", county: "Santa Clara" },
  "95046": { rate: 0.0875, city: "San Martin", county: "Santa Clara" },
  "95050": { rate: 0.0913, city: "Santa Clara", county: "Santa Clara" },
  "95051": { rate: 0.0913, city: "Santa Clara", county: "Santa Clara" },
  "95054": { rate: 0.0913, city: "Santa Clara", county: "Santa Clara" },
  "95070": { rate: 0.0913, city: "Saratoga", county: "Santa Clara" },
  "95110": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95111": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95112": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95113": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95116": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95117": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95118": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95119": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95120": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95121": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95122": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95123": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95124": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95125": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95126": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95127": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95128": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95129": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95130": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95131": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95132": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95133": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95134": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95135": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95136": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95138": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95139": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95140": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95141": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  "95148": { rate: 0.0863, city: "San Jose", county: "Santa Clara" },
  
  // Solano County
  "94510": { rate: 0.0875, city: "Benicia", county: "Solano" },
  "94512": { rate: 0.0875, city: "Benicia", county: "Solano" },
  "94533": { rate: 0.0875, city: "Fairfield", county: "Solano" },
  "94534": { rate: 0.0875, city: "Fairfield", county: "Solano" },
  "94535": { rate: 0.0875, city: "Travis AFB", county: "Solano" },
  "94571": { rate: 0.0875, city: "Rio Vista", county: "Solano" },
  "94589": { rate: 0.0875, city: "Vallejo", county: "Solano" },
  "94590": { rate: 0.0875, city: "Vallejo", county: "Solano" },
  "94591": { rate: 0.0875, city: "Vallejo", county: "Solano" },
  "95616": { rate: 0.0875, city: "Dixon", county: "Solano" },
  "95688": { rate: 0.0875, city: "Vacaville", county: "Solano" },
  "95687": { rate: 0.0875, city: "Vacaville", county: "Solano" },
  
  // Sonoma County
  "95401": { rate: 0.0875, city: "Santa Rosa", county: "Sonoma" },
  "95403": { rate: 0.0875, city: "Santa Rosa", county: "Sonoma" },
  "95404": { rate: 0.0875, city: "Santa Rosa", county: "Sonoma" },
  "95405": { rate: 0.0875, city: "Santa Rosa", county: "Sonoma" },
  "95409": { rate: 0.0875, city: "Santa Rosa", county: "Sonoma" },
  "95410": { rate: 0.0875, city: "Albion", county: "Sonoma" },
  "95412": { rate: 0.0875, city: "Annapolis", county: "Sonoma" },
  "95415": { rate: 0.0875, city: "Boyes Hot Springs", county: "Sonoma" },
  "95419": { rate: 0.0875, city: "Cazadero", county: "Sonoma" },
  "95420": { rate: 0.0875, city: "Cloverdale", county: "Sonoma" },
  "95421": { rate: 0.0875, city: "Cloverdale", county: "Sonoma" },
  "95425": { rate: 0.0875, city: "Duncan Mills", county: "Sonoma" },
  "95436": { rate: 0.0875, city: "Guerneville", county: "Sonoma" },
  "95441": { rate: 0.0875, city: "Healdsburg", county: "Sonoma" },
  "95442": { rate: 0.0875, city: "Jenner", county: "Sonoma" },
  "95448": { rate: 0.0875, city: "Occidental", county: "Sonoma" },
  "94951": { rate: 0.0875, city: "Petaluma", county: "Sonoma" },
  "94952": { rate: 0.0875, city: "Petaluma", county: "Sonoma" },
  "94953": { rate: 0.0875, city: "Petaluma", county: "Sonoma" },
  "94954": { rate: 0.0875, city: "Petaluma", county: "Sonoma" },
  "94972": { rate: 0.0875, city: "Valley Ford", county: "Sonoma" },
  "95472": { rate: 0.0875, city: "Sebastopol", county: "Sonoma" },
  "95473": { rate: 0.0875, city: "Sebastopol", county: "Sonoma" },
  "95476": { rate: 0.0875, city: "Sonoma", county: "Sonoma" },
  "95486": { rate: 0.0875, city: "Windsor", county: "Sonoma" },
  "95492": { rate: 0.0875, city: "Watsonville", county: "Sonoma" },
};

// Helper function to extract ZIP code from address string
export const extractZipFromAddress = (address: string): string | null => {
  if (!address) return null;
  
  // Match 5-digit ZIP codes (basic pattern)
  const zipMatch = address.match(/\b(\d{5})\b/);
  return zipMatch ? zipMatch[1] : null;
};

// Helper function to get Bay Area tax rate by ZIP code
export const getBayAreaTaxRateByZip = (zip: string): TaxData | null => {
  if (!zip) return null;
  
  const taxInfo = BAY_AREA_TAX_RATES[zip];
  if (!taxInfo) return null;
  
  return {
    rate: taxInfo.rate,
    description: `${taxInfo.city} Tax (${taxInfo.county} County)`,
    jurisdiction: `${taxInfo.city}, ${taxInfo.county} County`
  };
};

export const getTaxRateByLocation = (location: string): TaxData => {
  // Default tax rates by state/location
  const taxRates: Record<string, TaxData> = {
    'california': { rate: 0.0875, description: 'CA State Tax', jurisdiction: 'California' },
    'new york': { rate: 0.08, description: 'NY State Tax', jurisdiction: 'New York' },
    'texas': { rate: 0.0625, description: 'TX State Tax', jurisdiction: 'Texas' },
    'florida': { rate: 0.06, description: 'FL State Tax', jurisdiction: 'Florida' },
    'nevada': { rate: 0.0685, description: 'NV State Tax', jurisdiction: 'Nevada' },
    'washington': { rate: 0.065, description: 'WA State Tax', jurisdiction: 'Washington' },
  };

  // State abbreviations map (for exact matching with word boundaries)
  const stateAbbreviations: Record<string, TaxData> = {
    'ca': { rate: 0.0875, description: 'CA State Tax', jurisdiction: 'California' },
    'ny': { rate: 0.08, description: 'NY State Tax', jurisdiction: 'New York' },
    'tx': { rate: 0.0625, description: 'TX State Tax', jurisdiction: 'Texas' },
    'fl': { rate: 0.06, description: 'FL State Tax', jurisdiction: 'Florida' },
    'nv': { rate: 0.0685, description: 'NV State Tax', jurisdiction: 'Nevada' },
    'wa': { rate: 0.065, description: 'WA State Tax', jurisdiction: 'Washington' },
  };

  if (!location) {
    console.warn('[getTaxRateByLocation] No location provided');
    return { rate: 0.08, description: 'Default Tax', jurisdiction: 'Unknown' };
  }

  const normalizedLocation = location.toLowerCase().trim();
  console.log('[getTaxRateByLocation] Processing location:', location);

  // FIRST: Try Bay Area ZIP code lookup (highest priority)
  const zip = extractZipFromAddress(location);
  console.log('[getTaxRateByLocation] Extracted ZIP code:', zip || 'none');

  if (zip) {
    const bayAreaTax = getBayAreaTaxRateByZip(zip);
    if (bayAreaTax) {
      console.log(`[getTaxRateByLocation] ✅ Found Bay Area tax rate for ZIP ${zip}:`, {
        rate: (bayAreaTax.rate * 100).toFixed(3) + '%',
        city: bayAreaTax.jurisdiction
      });
      return bayAreaTax;
    } else {
      console.log(`[getTaxRateByLocation] ZIP ${zip} not in Bay Area database`);
    }
  }

  // SECOND: Try exact state/location match (full state names)
  if (taxRates[normalizedLocation]) {
    console.log('[getTaxRateByLocation] Found exact match:', normalizedLocation);
    return taxRates[normalizedLocation];
  }

  // THIRD: Try to find full state names in the location string
  for (const [key, taxData] of Object.entries(taxRates)) {
    if (normalizedLocation.includes(key)) {
      console.log('[getTaxRateByLocation] Found state match:', key);
      return taxData;
    }
  }

  // FOURTH: Try state abbreviations with word boundary matching (to avoid false matches like "ca" in "Africa")
  // Split location into words and check for exact state abbreviation matches
  const locationWords = normalizedLocation.split(/[\s,]+/);
  for (const word of locationWords) {
    if (stateAbbreviations[word]) {
      console.log('[getTaxRateByLocation] Found state abbreviation match:', word);
      return stateAbbreviations[word];
    }
  }

  // Default tax rate if no match found
  console.warn('[getTaxRateByLocation] ⚠️ No tax rate found, using default 8%');
  return { rate: 0.08, description: 'Default Tax', jurisdiction: 'Unknown' };
};

export const calculateTax = (subtotal: number, location: string): { amount: number; taxData: TaxData } => {
  const taxData = getTaxRateByLocation(location);
  const amount = subtotal * taxData.rate;
  return { amount, taxData };
};
