/**
 * Static ISO 3166-1 country reference table.
 *
 * Provides numeric/alpha2/alpha3 code cross-referencing plus a rough
 * centroid (used to place/repair map markers) and population (used to
 * derive per-100k incidence) for the ~100 most populous countries.
 *
 * `numeric` matches the zero-padded 3-digit ISO 3166-1 numeric code used as
 * the `id` on world-atlas / Natural Earth topojson country features (e.g.
 * "840" for the United States), which is what the world map join relies on.
 */

export type CountryEntry = {
  numeric: string;
  alpha2: string;
  alpha3: string;
  name: string;
  /** [longitude, latitude] */
  centroid: [number, number];
  population?: number;
};

export const COUNTRIES: CountryEntry[] = [
  { numeric: "004", alpha2: "AF", alpha3: "AFG", name: "Afghanistan", centroid: [67.71, 33.94], population: 42000000 },
  { numeric: "008", alpha2: "AL", alpha3: "ALB", name: "Albania", centroid: [20.17, 41.15], population: 2850000 },
  { numeric: "012", alpha2: "DZ", alpha3: "DZA", name: "Algeria", centroid: [1.66, 28.03], population: 45000000 },
  { numeric: "016", alpha2: "AS", alpha3: "ASM", name: "American Samoa", centroid: [-170.13, -14.27] },
  { numeric: "020", alpha2: "AD", alpha3: "AND", name: "Andorra", centroid: [1.52, 42.51] },
  { numeric: "024", alpha2: "AO", alpha3: "AGO", name: "Angola", centroid: [17.87, -11.2], population: 36000000 },
  { numeric: "660", alpha2: "AI", alpha3: "AIA", name: "Anguilla", centroid: [-63.07, 18.22] },
  { numeric: "028", alpha2: "AG", alpha3: "ATG", name: "Antigua and Barbuda", centroid: [-61.8, 17.06] },
  { numeric: "032", alpha2: "AR", alpha3: "ARG", name: "Argentina", centroid: [-63.62, -38.42], population: 45800000 },
  { numeric: "051", alpha2: "AM", alpha3: "ARM", name: "Armenia", centroid: [45.04, 40.07], population: 2780000 },
  { numeric: "533", alpha2: "AW", alpha3: "ABW", name: "Aruba", centroid: [-69.97, 12.52] },
  { numeric: "036", alpha2: "AU", alpha3: "AUS", name: "Australia", centroid: [133.78, -25.27], population: 26000000 },
  { numeric: "040", alpha2: "AT", alpha3: "AUT", name: "Austria", centroid: [14.55, 47.52], population: 9100000 },
  { numeric: "031", alpha2: "AZ", alpha3: "AZE", name: "Azerbaijan", centroid: [47.58, 40.14], population: 10200000 },
  { numeric: "044", alpha2: "BS", alpha3: "BHS", name: "Bahamas", centroid: [-77.4, 25.03] },
  { numeric: "048", alpha2: "BH", alpha3: "BHR", name: "Bahrain", centroid: [50.64, 26.07], population: 1500000 },
  { numeric: "050", alpha2: "BD", alpha3: "BGD", name: "Bangladesh", centroid: [90.36, 23.68], population: 173000000 },
  { numeric: "052", alpha2: "BB", alpha3: "BRB", name: "Barbados", centroid: [-59.54, 13.19] },
  { numeric: "112", alpha2: "BY", alpha3: "BLR", name: "Belarus", centroid: [27.95, 53.71], population: 9500000 },
  { numeric: "056", alpha2: "BE", alpha3: "BEL", name: "Belgium", centroid: [4.47, 50.5], population: 11700000 },
  { numeric: "084", alpha2: "BZ", alpha3: "BLZ", name: "Belize", centroid: [-88.5, 17.19] },
  { numeric: "204", alpha2: "BJ", alpha3: "BEN", name: "Benin", centroid: [2.32, 9.31], population: 13700000 },
  { numeric: "060", alpha2: "BM", alpha3: "BMU", name: "Bermuda", centroid: [-64.75, 32.32] },
  { numeric: "064", alpha2: "BT", alpha3: "BTN", name: "Bhutan", centroid: [90.43, 27.51] },
  { numeric: "068", alpha2: "BO", alpha3: "BOL", name: "Bolivia", centroid: [-63.59, -16.29], population: 12200000 },
  { numeric: "070", alpha2: "BA", alpha3: "BIH", name: "Bosnia and Herzegovina", centroid: [17.68, 43.92], population: 3200000 },
  { numeric: "072", alpha2: "BW", alpha3: "BWA", name: "Botswana", centroid: [24.68, -22.33], population: 2650000 },
  { numeric: "076", alpha2: "BR", alpha3: "BRA", name: "Brazil", centroid: [-51.93, -14.24], population: 216000000 },
  { numeric: "092", alpha2: "VG", alpha3: "VGB", name: "British Virgin Islands", centroid: [-64.64, 18.42] },
  { numeric: "096", alpha2: "BN", alpha3: "BRN", name: "Brunei", centroid: [114.73, 4.54] },
  { numeric: "100", alpha2: "BG", alpha3: "BGR", name: "Bulgaria", centroid: [25.49, 42.73], population: 6800000 },
  { numeric: "854", alpha2: "BF", alpha3: "BFA", name: "Burkina Faso", centroid: [-1.56, 12.24], population: 23000000 },
  { numeric: "108", alpha2: "BI", alpha3: "BDI", name: "Burundi", centroid: [29.92, -3.37], population: 12800000 },
  { numeric: "132", alpha2: "CV", alpha3: "CPV", name: "Cabo Verde", centroid: [-24.01, 16.54] },
  { numeric: "116", alpha2: "KH", alpha3: "KHM", name: "Cambodia", centroid: [104.99, 12.57], population: 16900000 },
  { numeric: "120", alpha2: "CM", alpha3: "CMR", name: "Cameroon", centroid: [12.35, 7.37], population: 28000000 },
  { numeric: "124", alpha2: "CA", alpha3: "CAN", name: "Canada", centroid: [-106.35, 56.13], population: 38900000 },
  { numeric: "136", alpha2: "KY", alpha3: "CYM", name: "Cayman Islands", centroid: [-80.57, 19.31] },
  { numeric: "140", alpha2: "CF", alpha3: "CAF", name: "Central African Republic", centroid: [20.94, 6.61], population: 5500000 },
  { numeric: "148", alpha2: "TD", alpha3: "TCD", name: "Chad", centroid: [18.73, 15.45], population: 18000000 },
  { numeric: "152", alpha2: "CL", alpha3: "CHL", name: "Chile", centroid: [-71.54, -35.68], population: 19600000 },
  { numeric: "156", alpha2: "CN", alpha3: "CHN", name: "China", centroid: [104.2, 35.86], population: 1412000000 },
  { numeric: "170", alpha2: "CO", alpha3: "COL", name: "Colombia", centroid: [-74.3, 4.57], population: 52000000 },
  { numeric: "174", alpha2: "KM", alpha3: "COM", name: "Comoros", centroid: [43.87, -11.65] },
  { numeric: "178", alpha2: "CG", alpha3: "COG", name: "Congo", centroid: [15.83, -0.23], population: 5900000 },
  { numeric: "184", alpha2: "CK", alpha3: "COK", name: "Cook Islands", centroid: [-159.78, -21.24] },
  { numeric: "188", alpha2: "CR", alpha3: "CRI", name: "Costa Rica", centroid: [-83.75, 9.75], population: 5150000 },
  { numeric: "384", alpha2: "CI", alpha3: "CIV", name: "Cote d'Ivoire", centroid: [-5.55, 7.54], population: 28000000 },
  { numeric: "191", alpha2: "HR", alpha3: "HRV", name: "Croatia", centroid: [15.2, 45.1], population: 3850000 },
  { numeric: "192", alpha2: "CU", alpha3: "CUB", name: "Cuba", centroid: [-77.78, 21.52], population: 11200000 },
  { numeric: "531", alpha2: "CW", alpha3: "CUW", name: "Curacao", centroid: [-68.99, 12.17] },
  { numeric: "196", alpha2: "CY", alpha3: "CYP", name: "Cyprus", centroid: [33.43, 35.13], population: 1250000 },
  { numeric: "203", alpha2: "CZ", alpha3: "CZE", name: "Czechia", centroid: [15.47, 49.82], population: 10500000 },
  { numeric: "180", alpha2: "CD", alpha3: "COD", name: "Democratic Republic of the Congo", centroid: [23.66, -2.88], population: 102000000 },
  { numeric: "208", alpha2: "DK", alpha3: "DNK", name: "Denmark", centroid: [9.5, 56.26], population: 5900000 },
  { numeric: "262", alpha2: "DJ", alpha3: "DJI", name: "Djibouti", centroid: [42.59, 11.83] },
  { numeric: "212", alpha2: "DM", alpha3: "DMA", name: "Dominica", centroid: [-61.37, 15.41] },
  { numeric: "214", alpha2: "DO", alpha3: "DOM", name: "Dominican Republic", centroid: [-70.16, 18.74], population: 11300000 },
  { numeric: "218", alpha2: "EC", alpha3: "ECU", name: "Ecuador", centroid: [-78.18, -1.83], population: 18000000 },
  { numeric: "818", alpha2: "EG", alpha3: "EGY", name: "Egypt", centroid: [30.8, 26.82], population: 112700000 },
  { numeric: "222", alpha2: "SV", alpha3: "SLV", name: "El Salvador", centroid: [-88.9, 13.79], population: 6300000 },
  { numeric: "226", alpha2: "GQ", alpha3: "GNQ", name: "Equatorial Guinea", centroid: [10.27, 1.65] },
  { numeric: "232", alpha2: "ER", alpha3: "ERI", name: "Eritrea", centroid: [39.78, 15.18] },
  { numeric: "233", alpha2: "EE", alpha3: "EST", name: "Estonia", centroid: [25.01, 58.6], population: 1330000 },
  { numeric: "748", alpha2: "SZ", alpha3: "SWZ", name: "Eswatini", centroid: [31.47, -26.52] },
  { numeric: "231", alpha2: "ET", alpha3: "ETH", name: "Ethiopia", centroid: [40.49, 9.15], population: 126500000 },
  { numeric: "238", alpha2: "FK", alpha3: "FLK", name: "Falkland Islands", centroid: [-59.52, -51.8] },
  { numeric: "234", alpha2: "FO", alpha3: "FRO", name: "Faroe Islands", centroid: [-6.91, 61.89] },
  { numeric: "242", alpha2: "FJ", alpha3: "FJI", name: "Fiji", centroid: [178.06, -17.71] },
  { numeric: "246", alpha2: "FI", alpha3: "FIN", name: "Finland", centroid: [25.75, 61.92], population: 5550000 },
  { numeric: "250", alpha2: "FR", alpha3: "FRA", name: "France", centroid: [2.21, 46.6], population: 68000000 },
  { numeric: "254", alpha2: "GF", alpha3: "GUF", name: "French Guiana", centroid: [-53.13, 3.93] },
  { numeric: "258", alpha2: "PF", alpha3: "PYF", name: "French Polynesia", centroid: [-149.41, -17.68] },
  { numeric: "266", alpha2: "GA", alpha3: "GAB", name: "Gabon", centroid: [11.61, -0.8], population: 2400000 },
  { numeric: "270", alpha2: "GM", alpha3: "GMB", name: "Gambia", centroid: [-15.31, 13.44], population: 2600000 },
  { numeric: "268", alpha2: "GE", alpha3: "GEO", name: "Georgia", centroid: [43.36, 42.32], population: 3700000 },
  { numeric: "276", alpha2: "DE", alpha3: "DEU", name: "Germany", centroid: [10.45, 51.17], population: 84400000 },
  { numeric: "288", alpha2: "GH", alpha3: "GHA", name: "Ghana", centroid: [-1.02, 7.95], population: 33500000 },
  { numeric: "292", alpha2: "GI", alpha3: "GIB", name: "Gibraltar", centroid: [-5.35, 36.14] },
  { numeric: "300", alpha2: "GR", alpha3: "GRC", name: "Greece", centroid: [21.82, 39.07], population: 10400000 },
  { numeric: "304", alpha2: "GL", alpha3: "GRL", name: "Greenland", centroid: [-42.6, 71.71] },
  { numeric: "308", alpha2: "GD", alpha3: "GRD", name: "Grenada", centroid: [-61.68, 12.11] },
  { numeric: "312", alpha2: "GP", alpha3: "GLP", name: "Guadeloupe", centroid: [-61.55, 16.27] },
  { numeric: "316", alpha2: "GU", alpha3: "GUM", name: "Guam", centroid: [144.79, 13.44] },
  { numeric: "320", alpha2: "GT", alpha3: "GTM", name: "Guatemala", centroid: [-90.23, 15.78], population: 18100000 },
  { numeric: "831", alpha2: "GG", alpha3: "GGY", name: "Guernsey", centroid: [-2.58, 49.47] },
  { numeric: "324", alpha2: "GN", alpha3: "GIN", name: "Guinea", centroid: [-9.7, 9.95], population: 14000000 },
  { numeric: "624", alpha2: "GW", alpha3: "GNB", name: "Guinea-Bissau", centroid: [-15.18, 11.8] },
  { numeric: "328", alpha2: "GY", alpha3: "GUY", name: "Guyana", centroid: [-58.93, 4.86] },
  { numeric: "332", alpha2: "HT", alpha3: "HTI", name: "Haiti", centroid: [-72.29, 18.97], population: 11700000 },
  { numeric: "340", alpha2: "HN", alpha3: "HND", name: "Honduras", centroid: [-86.24, 15.2], population: 10400000 },
  { numeric: "344", alpha2: "HK", alpha3: "HKG", name: "Hong Kong", centroid: [114.11, 22.4], population: 7400000 },
  { numeric: "348", alpha2: "HU", alpha3: "HUN", name: "Hungary", centroid: [19.5, 47.16], population: 9600000 },
  { numeric: "352", alpha2: "IS", alpha3: "ISL", name: "Iceland", centroid: [-19.02, 64.96] },
  { numeric: "356", alpha2: "IN", alpha3: "IND", name: "India", centroid: [78.96, 20.59], population: 1428600000 },
  { numeric: "360", alpha2: "ID", alpha3: "IDN", name: "Indonesia", centroid: [113.92, -0.79], population: 277500000 },
  { numeric: "364", alpha2: "IR", alpha3: "IRN", name: "Iran", centroid: [53.69, 32.43], population: 89200000 },
  { numeric: "368", alpha2: "IQ", alpha3: "IRQ", name: "Iraq", centroid: [43.68, 33.22], population: 45500000 },
  { numeric: "372", alpha2: "IE", alpha3: "IRL", name: "Ireland", centroid: [-8.24, 53.41], population: 5100000 },
  { numeric: "833", alpha2: "IM", alpha3: "IMN", name: "Isle of Man", centroid: [-4.55, 54.24] },
  { numeric: "376", alpha2: "IL", alpha3: "ISR", name: "Israel", centroid: [34.85, 31.05], population: 9700000 },
  { numeric: "380", alpha2: "IT", alpha3: "ITA", name: "Italy", centroid: [12.57, 41.87], population: 58900000 },
  { numeric: "388", alpha2: "JM", alpha3: "JAM", name: "Jamaica", centroid: [-77.3, 18.11], population: 2830000 },
  { numeric: "392", alpha2: "JP", alpha3: "JPN", name: "Japan", centroid: [138.25, 36.2], population: 123300000 },
  { numeric: "832", alpha2: "JE", alpha3: "JEY", name: "Jersey", centroid: [-2.14, 49.21] },
  { numeric: "400", alpha2: "JO", alpha3: "JOR", name: "Jordan", centroid: [36.24, 30.59], population: 11300000 },
  { numeric: "398", alpha2: "KZ", alpha3: "KAZ", name: "Kazakhstan", centroid: [66.92, 48.02], population: 19600000 },
  { numeric: "404", alpha2: "KE", alpha3: "KEN", name: "Kenya", centroid: [37.91, -0.02], population: 55100000 },
  { numeric: "296", alpha2: "KI", alpha3: "KIR", name: "Kiribati", centroid: [-168.73, -3.37] },
  { numeric: "383", alpha2: "XK", alpha3: "XKX", name: "Kosovo", centroid: [20.9, 42.6], population: 1770000 },
  { numeric: "414", alpha2: "KW", alpha3: "KWT", name: "Kuwait", centroid: [47.48, 29.31], population: 4300000 },
  { numeric: "417", alpha2: "KG", alpha3: "KGZ", name: "Kyrgyzstan", centroid: [74.77, 41.2], population: 7000000 },
  { numeric: "418", alpha2: "LA", alpha3: "LAO", name: "Laos", centroid: [102.5, 19.86], population: 7700000 },
  { numeric: "428", alpha2: "LV", alpha3: "LVA", name: "Latvia", centroid: [24.6, 56.88], population: 1830000 },
  { numeric: "422", alpha2: "LB", alpha3: "LBN", name: "Lebanon", centroid: [35.86, 33.85], population: 5500000 },
  { numeric: "426", alpha2: "LS", alpha3: "LSO", name: "Lesotho", centroid: [28.23, -29.61] },
  { numeric: "430", alpha2: "LR", alpha3: "LBR", name: "Liberia", centroid: [-9.43, 6.43] },
  { numeric: "434", alpha2: "LY", alpha3: "LBY", name: "Libya", centroid: [17.23, 26.34], population: 6900000 },
  { numeric: "438", alpha2: "LI", alpha3: "LIE", name: "Liechtenstein", centroid: [9.56, 47.17] },
  { numeric: "440", alpha2: "LT", alpha3: "LTU", name: "Lithuania", centroid: [23.88, 55.17], population: 2700000 },
  { numeric: "442", alpha2: "LU", alpha3: "LUX", name: "Luxembourg", centroid: [6.13, 49.82], population: 660000 },
  { numeric: "446", alpha2: "MO", alpha3: "MAC", name: "Macao", centroid: [113.55, 22.2] },
  { numeric: "450", alpha2: "MG", alpha3: "MDG", name: "Madagascar", centroid: [46.87, -18.77], population: 30300000 },
  { numeric: "454", alpha2: "MW", alpha3: "MWI", name: "Malawi", centroid: [34.3, -13.25], population: 20400000 },
  { numeric: "458", alpha2: "MY", alpha3: "MYS", name: "Malaysia", centroid: [101.98, 4.21], population: 33900000 },
  { numeric: "462", alpha2: "MV", alpha3: "MDV", name: "Maldives", centroid: [73.22, 3.2] },
  { numeric: "466", alpha2: "ML", alpha3: "MLI", name: "Mali", centroid: [-3.99, 17.57], population: 22600000 },
  { numeric: "470", alpha2: "MT", alpha3: "MLT", name: "Malta", centroid: [14.38, 35.94] },
  { numeric: "584", alpha2: "MH", alpha3: "MHL", name: "Marshall Islands", centroid: [171.18, 7.13] },
  { numeric: "474", alpha2: "MQ", alpha3: "MTQ", name: "Martinique", centroid: [-61.02, 14.64] },
  { numeric: "478", alpha2: "MR", alpha3: "MRT", name: "Mauritania", centroid: [-10.94, 21.01], population: 4900000 },
  { numeric: "480", alpha2: "MU", alpha3: "MUS", name: "Mauritius", centroid: [57.55, -20.35] },
  { numeric: "175", alpha2: "YT", alpha3: "MYT", name: "Mayotte", centroid: [45.17, -12.83] },
  { numeric: "484", alpha2: "MX", alpha3: "MEX", name: "Mexico", centroid: [-102.55, 23.63], population: 128500000 },
  { numeric: "583", alpha2: "FM", alpha3: "FSM", name: "Micronesia", centroid: [150.55, 6.92] },
  { numeric: "498", alpha2: "MD", alpha3: "MDA", name: "Moldova", centroid: [28.37, 47.41], population: 2500000 },
  { numeric: "492", alpha2: "MC", alpha3: "MCO", name: "Monaco", centroid: [7.42, 43.75] },
  { numeric: "496", alpha2: "MN", alpha3: "MNG", name: "Mongolia", centroid: [103.85, 46.86], population: 3400000 },
  { numeric: "499", alpha2: "ME", alpha3: "MNE", name: "Montenegro", centroid: [19.37, 42.71] },
  { numeric: "500", alpha2: "MS", alpha3: "MSR", name: "Montserrat", centroid: [-62.19, 16.74] },
  { numeric: "504", alpha2: "MA", alpha3: "MAR", name: "Morocco", centroid: [-7.09, 31.79], population: 37800000 },
  { numeric: "508", alpha2: "MZ", alpha3: "MOZ", name: "Mozambique", centroid: [35.53, -18.67], population: 33900000 },
  { numeric: "104", alpha2: "MM", alpha3: "MMR", name: "Myanmar", centroid: [95.96, 21.91], population: 54400000 },
  { numeric: "516", alpha2: "NA", alpha3: "NAM", name: "Namibia", centroid: [18.49, -22.96], population: 2600000 },
  { numeric: "520", alpha2: "NR", alpha3: "NRU", name: "Nauru", centroid: [166.93, -0.52] },
  { numeric: "524", alpha2: "NP", alpha3: "NPL", name: "Nepal", centroid: [84.12, 28.39], population: 30000000 },
  { numeric: "528", alpha2: "NL", alpha3: "NLD", name: "Netherlands", centroid: [5.29, 52.13], population: 17900000 },
  { numeric: "540", alpha2: "NC", alpha3: "NCL", name: "New Caledonia", centroid: [165.62, -20.9] },
  { numeric: "554", alpha2: "NZ", alpha3: "NZL", name: "New Zealand", centroid: [174.89, -40.9], population: 5200000 },
  { numeric: "558", alpha2: "NI", alpha3: "NIC", name: "Nicaragua", centroid: [-85.21, 12.87], population: 6900000 },
  { numeric: "562", alpha2: "NE", alpha3: "NER", name: "Niger", centroid: [8.08, 17.61], population: 27200000 },
  { numeric: "566", alpha2: "NG", alpha3: "NGA", name: "Nigeria", centroid: [8.68, 9.08], population: 223800000 },
  { numeric: "570", alpha2: "NU", alpha3: "NIU", name: "Niue", centroid: [-169.87, -19.05] },
  { numeric: "408", alpha2: "KP", alpha3: "PRK", name: "North Korea", centroid: [127.51, 40.34], population: 26200000 },
  { numeric: "807", alpha2: "MK", alpha3: "MKD", name: "North Macedonia", centroid: [21.75, 41.61], population: 2100000 },
  { numeric: "578", alpha2: "NO", alpha3: "NOR", name: "Norway", centroid: [8.47, 60.47], population: 5500000 },
  { numeric: "512", alpha2: "OM", alpha3: "OMN", name: "Oman", centroid: [55.92, 21.51], population: 4600000 },
  { numeric: "586", alpha2: "PK", alpha3: "PAK", name: "Pakistan", centroid: [69.35, 30.38], population: 240500000 },
  { numeric: "585", alpha2: "PW", alpha3: "PLW", name: "Palau", centroid: [134.58, 7.51] },
  { numeric: "275", alpha2: "PS", alpha3: "PSE", name: "Palestine", centroid: [35.23, 31.95], population: 5400000 },
  { numeric: "591", alpha2: "PA", alpha3: "PAN", name: "Panama", centroid: [-80.78, 8.54], population: 4400000 },
  { numeric: "598", alpha2: "PG", alpha3: "PNG", name: "Papua New Guinea", centroid: [143.96, -6.31], population: 10300000 },
  { numeric: "600", alpha2: "PY", alpha3: "PRY", name: "Paraguay", centroid: [-58.44, -23.44], population: 6900000 },
  { numeric: "604", alpha2: "PE", alpha3: "PER", name: "Peru", centroid: [-75.02, -9.19], population: 34400000 },
  { numeric: "608", alpha2: "PH", alpha3: "PHL", name: "Philippines", centroid: [121.77, 12.88], population: 114900000 },
  { numeric: "616", alpha2: "PL", alpha3: "POL", name: "Poland", centroid: [19.15, 51.92], population: 37700000 },
  { numeric: "620", alpha2: "PT", alpha3: "PRT", name: "Portugal", centroid: [-8.22, 39.4], population: 10300000 },
  { numeric: "630", alpha2: "PR", alpha3: "PRI", name: "Puerto Rico", centroid: [-66.59, 18.22] },
  { numeric: "634", alpha2: "QA", alpha3: "QAT", name: "Qatar", centroid: [51.18, 25.35], population: 2700000 },
  { numeric: "642", alpha2: "RO", alpha3: "ROU", name: "Romania", centroid: [24.97, 45.94], population: 19000000 },
  { numeric: "643", alpha2: "RU", alpha3: "RUS", name: "Russia", centroid: [105.32, 61.52], population: 143800000 },
  { numeric: "646", alpha2: "RW", alpha3: "RWA", name: "Rwanda", centroid: [29.87, -1.94], population: 13800000 },
  { numeric: "659", alpha2: "KN", alpha3: "KNA", name: "Saint Kitts and Nevis", centroid: [-62.78, 17.36] },
  { numeric: "662", alpha2: "LC", alpha3: "LCA", name: "Saint Lucia", centroid: [-60.98, 13.91] },
  { numeric: "670", alpha2: "VC", alpha3: "VCT", name: "Saint Vincent and the Grenadines", centroid: [-61.29, 12.98] },
  { numeric: "882", alpha2: "WS", alpha3: "WSM", name: "Samoa", centroid: [-172.1, -13.76] },
  { numeric: "674", alpha2: "SM", alpha3: "SMR", name: "San Marino", centroid: [12.46, 43.94] },
  { numeric: "678", alpha2: "ST", alpha3: "STP", name: "Sao Tome and Principe", centroid: [6.61, 0.19] },
  { numeric: "682", alpha2: "SA", alpha3: "SAU", name: "Saudi Arabia", centroid: [45.08, 23.89], population: 36400000 },
  { numeric: "686", alpha2: "SN", alpha3: "SEN", name: "Senegal", centroid: [-14.45, 14.5], population: 17700000 },
  { numeric: "688", alpha2: "RS", alpha3: "SRB", name: "Serbia", centroid: [21.01, 44.02], population: 6800000 },
  { numeric: "690", alpha2: "SC", alpha3: "SYC", name: "Seychelles", centroid: [55.49, -4.68] },
  { numeric: "694", alpha2: "SL", alpha3: "SLE", name: "Sierra Leone", centroid: [-11.78, 8.46], population: 8600000 },
  { numeric: "702", alpha2: "SG", alpha3: "SGP", name: "Singapore", centroid: [103.82, 1.35], population: 5900000 },
  { numeric: "534", alpha2: "SX", alpha3: "SXM", name: "Sint Maarten", centroid: [-63.06, 18.04] },
  { numeric: "703", alpha2: "SK", alpha3: "SVK", name: "Slovakia", centroid: [19.7, 48.67], population: 5450000 },
  { numeric: "705", alpha2: "SI", alpha3: "SVN", name: "Slovenia", centroid: [14.99, 46.15], population: 2100000 },
  { numeric: "090", alpha2: "SB", alpha3: "SLB", name: "Solomon Islands", centroid: [160.16, -9.65] },
  { numeric: "706", alpha2: "SO", alpha3: "SOM", name: "Somalia", centroid: [46.2, 5.15], population: 18100000 },
  { numeric: "710", alpha2: "ZA", alpha3: "ZAF", name: "South Africa", centroid: [22.94, -30.56], population: 60400000 },
  { numeric: "410", alpha2: "KR", alpha3: "KOR", name: "South Korea", centroid: [127.77, 35.91], population: 51700000 },
  { numeric: "728", alpha2: "SS", alpha3: "SSD", name: "South Sudan", centroid: [31.31, 6.88], population: 11100000 },
  { numeric: "724", alpha2: "ES", alpha3: "ESP", name: "Spain", centroid: [-3.75, 40.46], population: 47600000 },
  { numeric: "144", alpha2: "LK", alpha3: "LKA", name: "Sri Lanka", centroid: [80.77, 7.87], population: 22000000 },
  { numeric: "729", alpha2: "SD", alpha3: "SDN", name: "Sudan", centroid: [30.22, 12.86], population: 48100000 },
  { numeric: "740", alpha2: "SR", alpha3: "SUR", name: "Suriname", centroid: [-56.03, 3.92] },
  { numeric: "752", alpha2: "SE", alpha3: "SWE", name: "Sweden", centroid: [18.64, 60.13], population: 10500000 },
  { numeric: "756", alpha2: "CH", alpha3: "CHE", name: "Switzerland", centroid: [8.23, 46.82], population: 8800000 },
  { numeric: "760", alpha2: "SY", alpha3: "SYR", name: "Syria", centroid: [38.99, 34.8], population: 23200000 },
  { numeric: "158", alpha2: "TW", alpha3: "TWN", name: "Taiwan", centroid: [120.96, 23.7], population: 23600000 },
  { numeric: "762", alpha2: "TJ", alpha3: "TJK", name: "Tajikistan", centroid: [71.28, 38.86], population: 10100000 },
  { numeric: "834", alpha2: "TZ", alpha3: "TZA", name: "Tanzania", centroid: [34.89, -6.37], population: 67400000 },
  { numeric: "764", alpha2: "TH", alpha3: "THA", name: "Thailand", centroid: [100.99, 15.87], population: 71800000 },
  { numeric: "626", alpha2: "TL", alpha3: "TLS", name: "Timor-Leste", centroid: [125.73, -8.87] },
  { numeric: "768", alpha2: "TG", alpha3: "TGO", name: "Togo", centroid: [0.82, 8.62], population: 8800000 },
  { numeric: "776", alpha2: "TO", alpha3: "TON", name: "Tonga", centroid: [-175.2, -21.18] },
  { numeric: "780", alpha2: "TT", alpha3: "TTO", name: "Trinidad and Tobago", centroid: [-61.22, 10.69], population: 1530000 },
  { numeric: "788", alpha2: "TN", alpha3: "TUN", name: "Tunisia", centroid: [9.54, 33.89], population: 12300000 },
  { numeric: "792", alpha2: "TR", alpha3: "TUR", name: "Turkey", centroid: [35.24, 38.96], population: 85300000 },
  { numeric: "795", alpha2: "TM", alpha3: "TKM", name: "Turkmenistan", centroid: [59.56, 38.97], population: 6400000 },
  { numeric: "796", alpha2: "TC", alpha3: "TCA", name: "Turks and Caicos Islands", centroid: [-71.8, 21.69] },
  { numeric: "798", alpha2: "TV", alpha3: "TUV", name: "Tuvalu", centroid: [177.65, -7.11] },
  { numeric: "800", alpha2: "UG", alpha3: "UGA", name: "Uganda", centroid: [32.29, 1.37], population: 48600000 },
  { numeric: "804", alpha2: "UA", alpha3: "UKR", name: "Ukraine", centroid: [31.17, 48.38], population: 36700000 },
  { numeric: "784", alpha2: "AE", alpha3: "ARE", name: "United Arab Emirates", centroid: [53.85, 23.42], population: 9400000 },
  { numeric: "826", alpha2: "GB", alpha3: "GBR", name: "United Kingdom", centroid: [-3.44, 55.38], population: 67700000 },
  { numeric: "840", alpha2: "US", alpha3: "USA", name: "United States", centroid: [-95.71, 37.09], population: 334900000 },
  { numeric: "858", alpha2: "UY", alpha3: "URY", name: "Uruguay", centroid: [-55.77, -32.52], population: 3400000 },
  { numeric: "860", alpha2: "UZ", alpha3: "UZB", name: "Uzbekistan", centroid: [64.59, 41.38], population: 35600000 },
  { numeric: "548", alpha2: "VU", alpha3: "VUT", name: "Vanuatu", centroid: [166.96, -15.38] },
  { numeric: "336", alpha2: "VA", alpha3: "VAT", name: "Vatican City", centroid: [12.45, 41.9] },
  { numeric: "862", alpha2: "VE", alpha3: "VEN", name: "Venezuela", centroid: [-66.59, 6.42], population: 28300000 },
  { numeric: "704", alpha2: "VN", alpha3: "VNM", name: "Vietnam", centroid: [108.28, 14.06], population: 98900000 },
  { numeric: "850", alpha2: "VI", alpha3: "VIR", name: "Virgin Islands (U.S.)", centroid: [-64.9, 18.34] },
  { numeric: "876", alpha2: "WF", alpha3: "WLF", name: "Wallis and Futuna", centroid: [-177.16, -13.77] },
  { numeric: "732", alpha2: "EH", alpha3: "ESH", name: "Western Sahara", centroid: [-12.89, 24.22] },
  { numeric: "887", alpha2: "YE", alpha3: "YEM", name: "Yemen", centroid: [48.52, 15.55], population: 34400000 },
  { numeric: "894", alpha2: "ZM", alpha3: "ZMB", name: "Zambia", centroid: [27.85, -13.13], population: 20600000 },
  { numeric: "716", alpha2: "ZW", alpha3: "ZWE", name: "Zimbabwe", centroid: [29.15, -19.02], population: 16300000 },
];

/** Common aliases / alternate spellings that resolve to a canonical entry name. */
const NAME_ALIASES: Record<string, string> = {
  usa: "united states",
  "united states of america": "united states",
  "us of a": "united states",
  america: "united states",
  uk: "united kingdom",
  "great britain": "united kingdom",
  britain: "united kingdom",
  drc: "democratic republic of the congo",
  "dr congo": "democratic republic of the congo",
  "congo-kinshasa": "democratic republic of the congo",
  "democratic republic of congo": "democratic republic of the congo",
  "republic of the congo": "congo",
  "congo-brazzaville": "congo",
  "congo, dem. rep.": "democratic republic of the congo",
  "russian federation": "russia",
  "south korea": "south korea",
  "republic of korea": "south korea",
  korea: "south korea",
  "north korea": "north korea",
  "democratic people's republic of korea": "north korea",
  "dprk": "north korea",
  "ivory coast": "cote d'ivoire",
  "côte d'ivoire": "cote d'ivoire",
  "cote divoire": "cote d'ivoire",
  burma: "myanmar",
  swaziland: "eswatini",
  "czech republic": "czechia",
  "cape verde": "cabo verde",
  "east timor": "timor-leste",
  vatican: "vatican city",
  "holy see": "vatican city",
  "uae": "united arab emirates",
  "u.a.e.": "united arab emirates",
  "palestinian territories": "palestine",
  "state of palestine": "palestine",
  "macedonia": "north macedonia",
  "syrian arab republic": "syria",
  "laos pdr": "laos",
  "lao pdr": "laos",
  "viet nam": "vietnam",
  "brunei darussalam": "brunei",
  "the bahamas": "bahamas",
  "the gambia": "gambia",
  "kyrgyz republic": "kyrgyzstan",
  "slovak republic": "slovakia",
  "moldova, republic of": "moldova",
  "iran, islamic republic of": "iran",
  "bolivia, plurinational state of": "bolivia",
  "venezuela, bolivarian republic of": "venezuela",
  "tanzania, united republic of": "tanzania",
  eswatini_swaziland: "eswatini",
  "hong kong sar": "hong kong",
  "hong kong sar china": "hong kong",
  "macao sar": "macao",
  "macau": "macao",
  "st. kitts and nevis": "saint kitts and nevis",
  "st kitts and nevis": "saint kitts and nevis",
  "st. lucia": "saint lucia",
  "st lucia": "saint lucia",
  "st. vincent and the grenadines": "saint vincent and the grenadines",
  "st vincent and the grenadines": "saint vincent and the grenadines",
};

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s'-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const byNumericMap = new Map<string, CountryEntry>();
const byAlpha2Map = new Map<string, CountryEntry>();
const byAlpha3Map = new Map<string, CountryEntry>();
const byNameMap = new Map<string, CountryEntry>();

for (const entry of COUNTRIES) {
  byNumericMap.set(entry.numeric, entry);
  byNumericMap.set(String(Number(entry.numeric)), entry);
  byAlpha2Map.set(entry.alpha2.toUpperCase(), entry);
  byAlpha3Map.set(entry.alpha3.toUpperCase(), entry);
  byNameMap.set(normalizeName(entry.name), entry);
}

for (const [alias, canonicalName] of Object.entries(NAME_ALIASES)) {
  const target = byNameMap.get(normalizeName(canonicalName));
  if (target) {
    byNameMap.set(normalizeName(alias), target);
  }
}

/** Look up a country by ISO 3166-1 numeric code (e.g. "840" or "004"; unpadded also matches). */
export function byNumeric(id: string | number | undefined | null): CountryEntry | undefined {
  if (id === undefined || id === null) return undefined;
  const key = String(id).trim();
  return byNumericMap.get(key) ?? byNumericMap.get(key.padStart(3, "0"));
}

/** Look up a country by ISO 3166-1 alpha-2 code (e.g. "US"). Case-insensitive. */
export function byAlpha2(code: string | undefined | null): CountryEntry | undefined {
  if (!code) return undefined;
  return byAlpha2Map.get(code.trim().toUpperCase());
}

/** Look up a country by ISO 3166-1 alpha-3 code (e.g. "USA"). Case-insensitive. */
export function byAlpha3(code: string | undefined | null): CountryEntry | undefined {
  if (!code) return undefined;
  return byAlpha3Map.get(code.trim().toUpperCase());
}

/**
 * Look up a country by (possibly informal) name. Normalizes casing/diacritics
 * and resolves common aliases (USA, DRC, Russia, South Korea, etc.).
 */
export function byName(name: string | undefined | null): CountryEntry | undefined {
  if (!name) return undefined;
  return byNameMap.get(normalizeName(name));
}

/** Returns the [lng, lat] centroid for a country given its alpha-2 code. */
export function getCentroid(alpha2: string | undefined | null): [number, number] | undefined {
  return byAlpha2(alpha2)?.centroid;
}

/** Returns the known population for a country given its alpha-2 code, if available. */
export function getPopulation(alpha2: string | undefined | null): number | undefined {
  return byAlpha2(alpha2)?.population;
}
