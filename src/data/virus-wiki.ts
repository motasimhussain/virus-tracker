import { isVirusSlug, type VirusSlug } from "@/lib/viruses";

export type VirusWikiSeeAlso = {
  label: string;
  href: string;
};

export type VirusWikiContent = {
  slug: string;
  lead: string;
  overview: string;
  transmission: string;
  symptoms: string;
  prevention: string;
  surveillance: string;
  disclaimer: string;
  seeAlso?: VirusWikiSeeAlso[];
  faq?: Array<{ question: string; answer: string }>;
};

const STANDARD_DISCLAIMER =
  "Virus Tracker provides aggregated outbreak monitoring for education and situational awareness. It is not medical advice, a diagnostic service, or a substitute for guidance from qualified health professionals or official public health agencies. Always consult licensed clinicians and authoritative sources for personal health decisions.";

const REGISTRY: Record<VirusSlug, VirusWikiContent> = {
  "covid-19": {
    slug: "covid-19",
    lead: "COVID-19 is a respiratory disease caused by the SARS-CoV-2 virus. Global surveillance tracks cases, severity, and regional pressure to highlight emerging waves and healthcare stress.",
    overview:
      "Coronavirus disease 2019 (COVID-19) emerged as a pandemic pathogen with broad geographic spread. Surveillance combines laboratory-confirmed cases, mortality reporting, and recovery metrics. Variant dynamics and vaccination coverage continue to shape transmission intensity in different regions. Analysts watch lagging indicators such as hospital utilization alongside case counts. This wiki summarizes how Virus Tracker surfaces country-level and subnational signals so operators can compare relative burden across geographies. Data blends open feeds and resilient fallbacks; confidence metadata helps interpret uncertainty where reporting is uneven.",
    transmission:
      "SARS-CoV-2 spreads primarily through respiratory droplets and aerosols in shared airspace, with risk elevated in crowded, poorly ventilated settings. Contact with contaminated surfaces plays a smaller role. Infectiousness varies by variant, symptom status, and individual immune history. Public health guidance emphasizes ventilation, masking in high-risk contexts, and staying home when symptomatic. Travel and large gatherings can accelerate introductions between regions, which is why geographic heat maps remain useful for spotting redistribution of pressure.",
    symptoms:
      "Illness ranges from asymptomatic infection to severe pneumonia and multisystem complications. Common symptoms include fever, cough, fatigue, anosmia, sore throat, and headache. Severe disease is more frequent among older adults and people with underlying conditions, though healthy individuals can also experience prolonged symptoms. Clinicians use testing and clinical criteria; self-assessment cannot replace professional evaluation.",
    prevention:
      "Layered prevention includes vaccines where available and recommended, improving indoor air quality, hand hygiene, and reducing exposure when community levels rise. Organizations may add testing and isolation policies aligned with local regulations. Travelers should follow destination requirements and monitor for symptoms after exposure. No single measure eliminates risk; combined strategies reduce incidence and severe outcomes at population scale.",
    surveillance:
      "Effective COVID-19 surveillance combines case reporting, variant sequencing where feasible, wastewater signals in some jurisdictions, and syndromic indicators. Reporting delays and testing capacity constraints can skew short-term trends. Virus Tracker normalizes heterogeneous sources and surfaces source confidence so readers can weigh freshness and coverage. Cross-checking with WHO, CDC, ECDC, or national dashboards remains essential for policy-grade decisions.",
    disclaimer: STANDARD_DISCLAIMER,
    seeAlso: [{ label: "Global heat map (COVID-19)", href: "/map?virus=covid-19" }],
    faq: [
      {
        question: "Why do map colors differ between countries?",
        answer:
          "Colors reflect relative active-case intensity within the dataset shown for this virus, not an absolute clinical threshold. Sparse reporting can make a country appear cooler even when community burden exists.",
      },
      {
        question: "How does COVID-19 spread?",
        answer:
          "Mainly through respiratory droplets and small airborne particles when an infected person breathes, talks, coughs, or sneezes near others, especially indoors with poor ventilation.",
      },
      {
        question: "Is there a vaccine?",
        answer:
          "Yes. Vaccines are widely available in most countries and are updated periodically to better match circulating variants. Check with a local health provider for current recommendations.",
      },
      {
        question: "How long are people contagious?",
        answer:
          "Most people are most infectious in the first few days of symptoms, but this varies by individual and variant. Testing and symptom-based guidance from local health authorities are the most reliable way to judge when it's safe to be around others.",
      },
    ],
  },
  zika: {
    slug: "zika",
    lead: "Zika is a virus spread mainly by mosquito bites that causes outbreaks in tropical and subtropical regions, with special risks for pregnant women and their babies.",
    overview:
      "Zika virus was recognized internationally after large outbreaks in the Americas. Many infections are mild or asymptomatic, which complicates case detection. The virus is transmitted primarily by Aedes mosquitoes and can also spread through sexual contact and blood products. Historical associations with congenital Zika syndrome underscore why pregnancy-related guidance differs from general population messaging. Virus Tracker highlights regional counts and trajectory-style signals where data exists, helping teams prioritize vector control partnerships and traveler education.",
    transmission:
      "Urban Aedes species bridge human-to-human transmission cycles in endemic areas. Travelers can introduce virus into receptive regions with competent vectors. Sexual transmission has been documented; blood safety measures address transfusion risk. Vertical transmission from mother to fetus is a critical public health concern during outbreaks. Seasonal rainfall and temperature influence vector abundance and biting rates.",
    symptoms:
      "Typical illness includes rash, fever, conjunctivitis, arthralgia, and myalgia, often lasting days to a week. Neurologic complications such as Guillain-Barré syndrome have been reported rarely. Infection during pregnancy can lead to severe fetal outcomes; screening protocols depend on local epidemiology and clinical guidance.",
    prevention:
      "Prevention combines personal protection against bites (repellents, clothing, bed nets where appropriate), community vector source reduction, and travel advisories for pregnant individuals in high-transmission settings. Integrated mosquito management programs are more effective than single interventions. There is no universally deployed vaccine for all populations as of typical open-data timelines; check current national recommendations.",
    surveillance:
      "Programs may include clinical case reporting, sentinel surveillance, serosurveys, and entomological monitoring. Cross-border coordination matters because vectors do not respect borders. Virus Tracker aggregates open metrics to visualize relative regional burden but should be paired with entomological risk assessments for operational response.",
    disclaimer: STANDARD_DISCLAIMER,
    seeAlso: [{ label: "Zika on heat map", href: "/map?virus=zika" }],
    faq: [
      {
        question: "How do people catch Zika?",
        answer:
          "Most infections come from the bite of an infected Aedes mosquito. It can also spread through sexual contact and, rarely, from a pregnant woman to her fetus.",
      },
      {
        question: "Is there a vaccine for Zika?",
        answer:
          "No vaccine is broadly available yet. Prevention relies on avoiding mosquito bites and reducing breeding sites near homes.",
      },
      {
        question: "Why is Zika especially concerning during pregnancy?",
        answer:
          "Infection during pregnancy has been linked to serious birth defects, including microcephaly. Pregnant travelers are advised to avoid areas with active Zika transmission when possible.",
      },
    ],
  },
  chikungunya: {
    slug: "chikungunya",
    lead: "Chikungunya is a mosquito-borne virus that causes fever and often severe joint pain; outbreaks can overwhelm local clinics when cases spike.",
    overview:
      "Chikungunya circulates in Africa, Asia, parts of Europe, and the Americas. Explosive outbreaks can occur when susceptible populations meet abundant vectors. Joint symptoms may persist for months, impacting workforce productivity even when acute fever resolves. Virus Tracker maps regional case pressure to complement entomological risk mapping and hospital triage planning.",
    transmission:
      "Aedes mosquitoes, especially Aedes aegypti and Aedes albopictus, transmit the virus between humans. Rare vertical and bloodborne routes have been described. Travel-associated cases seed new areas where vectors are present.",
    symptoms:
      "High fever and severe polyarthralgia are hallmark features; rash and myalgia are common. Most patients recover, but chronic arthralgia can occur. Differential diagnosis includes dengue, where misclassification can affect clinical management.",
    prevention:
      "Vector control, environmental management of breeding sites, and personal bite prevention are central. Community engagement improves sustained source reduction. Clinicians should follow local algorithms distinguishing dengue and chikungunya where both circulate.",
    surveillance:
      "Syndromic surveillance, lab confirmation, and outbreak line lists feed national dashboards. Virus Tracker visualizes multi-country snapshots for comparative situational awareness.",
    disclaimer: STANDARD_DISCLAIMER,
    seeAlso: [{ label: "Chikungunya heat map", href: "/map?virus=chikungunya" }],
    faq: [
      {
        question: "How do people catch chikungunya?",
        answer:
          "Through the bite of an infected Aedes mosquito, the same species that spreads dengue and Zika. It does not typically spread directly between people.",
      },
      {
        question: "Is chikungunya usually fatal?",
        answer:
          "Death is rare. The bigger burden is often weeks or months of joint pain after the fever resolves, which can affect work and daily life.",
      },
      {
        question: "Is there a vaccine?",
        answer:
          "A small number of countries have approved chikungunya vaccines for specific populations. Availability varies, so check current national guidance.",
      },
    ],
  },
  nipah: {
    slug: "nipah",
    lead: "Nipah is a rare but often deadly virus that can spread from bats or pigs to people, mostly in South and Southeast Asia.",
    overview:
      "Nipah virus causes severe encephalitis and respiratory disease. Spillover events remain episodic but carry outsized public concern due to severity and potential for nosocomial amplification. Surveillance integrates animal health, food safety, and rapid isolation protocols. Virus Tracker provides a high-level geographic lens on reported human activity where open datasets exist.",
    transmission:
      "Fruit bats (flying foxes) are natural reservoirs. Humans may be infected through consumption of contaminated date palm sap or close contact with infected animals or humans in healthcare settings without adequate infection prevention.",
    symptoms:
      "Illness may present as fever, headache, drowsiness, disorientation, and respiratory symptoms; encephalitis can progress rapidly. Early isolation and supportive care are critical.",
    prevention:
      "Avoid raw sap where outbreaks occur, use personal protective equipment around suspect cases, and strengthen hospital infection control. Community messaging should be culturally tailored and coordinated with veterinary services.",
    surveillance:
      "Event-based surveillance, contact tracing, and laboratory networks anchor response. Cross-sector alerts reduce delay between animal signals and human case detection.",
    disclaimer: STANDARD_DISCLAIMER,
    seeAlso: [{ label: "Nipah heat map", href: "/map?virus=nipah" }],
    faq: [
      {
        question: "How do people catch Nipah virus?",
        answer:
          "By drinking raw date palm sap contaminated by fruit bats, touching infected pigs, or close contact with an infected person, especially in a hospital without proper precautions.",
      },
      {
        question: "Is there a vaccine or cure?",
        answer:
          "No approved vaccine or specific antiviral treatment exists yet. Care focuses on early isolation and supportive treatment, which improves the chances of survival.",
      },
      {
        question: "Why is Nipah taken so seriously despite being rare?",
        answer:
          "It kills a large share of the people it infects and has caused hospital-based outbreaks in the past, so health authorities respond quickly to any suspected case.",
      },
    ],
  },
  "avian-influenza-h5n1": {
    slug: "avian-influenza-h5n1",
    lead: "H5N1 bird flu mainly infects poultry and wild birds, but occasional human infections keep health agencies watching for pandemic risk.",
    overview:
      "H5N1 viruses cause massive losses in poultry and periodic wild bird die-offs. Human cases remain relatively rare but severe when they occur, driving occupational safety standards for farm and culling workers. Virus Tracker tracks regional human and animal-linked signals where metrics are mirrored in open datasets alongside outbreak narratives.",
    transmission:
      "Humans are typically infected through close contact with sick or dead infected birds or highly contaminated environments. Sustained human-to-human transmission is not characteristic of seasonal influenza patterns.",
    symptoms:
      "Severe respiratory disease, fever, and systemic complications have been reported. Mild cases may be under-ascertained. Clinical suspicion should trigger appropriate diagnostics and infection control.",
    prevention:
      "Biosecurity on farms, safe handling of sick animals, personal protective equipment for responders, and public guidance to avoid unsafe poultry products reduce risk. Vaccine strategies differ for animals and humans and follow national policy.",
    surveillance:
      "Animal and human systems must interoperate: veterinary notifications often precede human detections. Genomic tracking informs antigenic updates and risk communication.",
    disclaimer: STANDARD_DISCLAIMER,
    seeAlso: [{ label: "H5N1 heat map", href: "/map?virus=avian-influenza-h5n1" }],
    faq: [
      {
        question: "How do people catch H5N1?",
        answer:
          "Almost all human cases come from close contact with infected birds, their droppings, or heavily contaminated environments such as poultry farms and live-bird markets.",
      },
      {
        question: "Can H5N1 spread between people?",
        answer:
          "Sustained person-to-person spread has not been seen. Occasional close-contact transmission cannot be ruled out, which is why health agencies monitor cases closely.",
      },
      {
        question: "Is there a vaccine?",
        answer:
          "Vaccines exist for poultry, and some countries maintain human vaccine stockpiles for pandemic preparedness, but no H5N1 vaccine is in routine public use.",
      },
    ],
  },
  "lassa-fever": {
    slug: "lassa-fever",
    lead: "Lassa fever is a viral illness spread mainly by rodents in parts of West Africa, and it can also pass between people in hospitals without proper precautions.",
    overview:
      "Mastomys rodents shed virus in urine and feces; humans become infected through contact with contaminated food or surfaces. Seasonal peaks align with agricultural and dry-season rodent-human interface patterns. Virus Tracker helps visualize regional case pressure alongside broader viral hemorrhagic fever differential diagnoses in surveillance briefings.",
    transmission:
      "Rodentborne exposure dominates; secondary transmission occurs through bodily fluids in healthcare and household settings without barrier precautions.",
    symptoms:
      "Fever, weakness, headache, sore throat, and in severe cases bleeding, shock, and organ dysfunction. Early supportive care improves outcomes; ribavirin may be used per protocol.",
    prevention:
      "Rodent control, food storage hygiene, safe burial practices, and rigorous healthcare PPE and triage reduce risk. Community trust accelerates reporting.",
    surveillance:
      "Integrated human and environmental surveillance with rapid diagnostics strengthens containment. Cross-border coordination limits silent spread along trade routes.",
    disclaimer: STANDARD_DISCLAIMER,
    seeAlso: [{ label: "Lassa fever heat map", href: "/map?virus=lassa-fever" }],
    faq: [
      {
        question: "How do people catch Lassa fever?",
        answer:
          "Mostly by eating food or touching surfaces contaminated with urine or droppings from infected Mastomys rats. It can also spread between people through contact with infected blood or body fluids.",
      },
      {
        question: "Is there a vaccine or treatment?",
        answer:
          "No approved vaccine exists yet. The antiviral drug ribavirin may help if given early, alongside supportive medical care.",
      },
      {
        question: "How dangerous is Lassa fever?",
        answer:
          "Most infections are mild or without symptoms, but a minority of cases become severe and can be fatal, particularly late in pregnancy.",
      },
    ],
  },
  marburg: {
    slug: "marburg",
    lead: "Marburg virus causes a severe, often fatal illness with bleeding and shock; stopping outbreaks requires fast contact tracing, safe burials, and strict infection control.",
    overview:
      "Marburg virus disease (MVD) is filovirus-related to Ebola virus disease. Fruit bats are reservoir hosts; human outbreaks often amplify in healthcare settings. High mortality and stigma complicate control. Virus Tracker offers geographic context for open metrics where available.",
    transmission:
      "Direct contact with blood, secretions, organs, or surfaces contaminated by symptomatic or deceased patients drives chains of transmission.",
    symptoms:
      "Sudden onset fever, headache, vomiting, diarrhea, hemorrhagic signs in severe cases. Early supportive care and isolation are essential.",
    prevention:
      "Ring vaccination where licensed products exist, safe dignified burials, PPE training, and community surveillance reduce reproductive number of chains.",
    surveillance:
      "GeneXpert-style rapid tests and contact tracing timelines define success metrics alongside traditional case counts.",
    disclaimer: STANDARD_DISCLAIMER,
    seeAlso: [{ label: "Marburg heat map", href: "/map?virus=marburg" }],
    faq: [
      {
        question: "How do people catch Marburg virus?",
        answer:
          "Initial infections usually come from contact with fruit bats or their droppings in caves or mines. After that, it spreads between people through direct contact with blood or other body fluids.",
      },
      {
        question: "Is there a vaccine?",
        answer:
          "An experimental vaccine has been used in ring-vaccination trials during outbreaks, but no product is yet fully licensed for general use.",
      },
      {
        question: "How deadly is Marburg virus disease?",
        answer:
          "Case-fatality rates have varied widely between outbreaks, from roughly 20% to over 80%, depending on the virus strain and how quickly patients receive care.",
      },
    ],
  },
  hantavirus: {
    slug: "hantavirus",
    lead: "Hantaviruses spread when people breathe in dust contaminated with rodent droppings or urine, and can cause severe kidney or lung illness depending on the region.",
    overview:
      "Rodent reservoirs shed virus chronically. Human risk rises when cleaning closed spaces with active infestations. Virus Tracker includes representative regional metrics where syndromic data is mirrored in open feeds.",
    transmission:
      "Inhalation of aerosolized particles from rodent urine, droppings, or nests is classic; bite risk is lower but possible.",
    symptoms:
      "Febrile prodrome progressing to capillary leak syndromes with pulmonary or renal involvement depending on virus species.",
    prevention:
      "Ventilate before cleaning, use respirators when disturbing infested material, and professional rodent control in high-risk structures.",
    surveillance:
      "Environmental health inspections complement case reporting; occupational health tracks at-risk workers.",
    disclaimer: STANDARD_DISCLAIMER,
    seeAlso: [{ label: "Hantavirus heat map", href: "/map?virus=hantavirus" }],
    faq: [
      {
        question: "How do people catch hantavirus?",
        answer:
          "Mainly by breathing in dust stirred up from rodent droppings, urine, or nesting material, often while cleaning sheds, cabins, or storage areas with rodent activity.",
      },
      {
        question: "Can hantavirus spread between people?",
        answer:
          "Generally no, with the exception of one South American strain (Andes virus) where limited person-to-person spread has been documented.",
      },
      {
        question: "Is there a vaccine or treatment?",
        answer:
          "No vaccine is widely available. Treatment is supportive care, often in an intensive care setting for severe cases, so prevention through rodent control is key.",
      },
    ],
  },
  dengue: {
    slug: "dengue",
    lead: "Dengue is the world's most common mosquito-borne viral disease; getting infected more than once raises the risk of a severe, sometimes life-threatening case.",
    overview:
      "Four serotypes circulate, enabling sequential infections that shape population immunity profiles. Urbanization and vector expansion widen the at-risk map. Virus Tracker highlights active-case heat and trajectory proxies to support seasonal preparedness.",
    transmission:
      "Aedes mosquitoes transmit dengue viruses; vertical transmission and blood products are secondary concerns.",
    symptoms:
      "Classic dengue fever with pain behind the eyes, rash, and leukopenia; warning signs herald plasma leakage in severe dengue.",
    prevention:
      "Vector control, community cleanup campaigns, Wolbachia programs where deployed, and cautious fluid management in hospitals. Vaccines exist in select jurisdictions with specific eligibility rules.",
    surveillance:
      "Entomological indices and case notification together guide outbreak classification. Serotype data informs epidemic forecasting.",
    disclaimer: STANDARD_DISCLAIMER,
    seeAlso: [{ label: "Dengue heat map", href: "/map?virus=dengue" }],
    faq: [
      {
        question: "How do people catch dengue?",
        answer:
          "Through the bite of an infected Aedes mosquito, typically one that bites during daylight hours in and around homes.",
      },
      {
        question: "Is there a vaccine for dengue?",
        answer:
          "Yes, dengue vaccines exist in some countries, but eligibility is often restricted to people with a prior confirmed dengue infection. Check local guidance before seeking one.",
      },
      {
        question: "What are the warning signs of severe dengue?",
        answer:
          "Persistent vomiting, severe abdominal pain, bleeding gums, and difficulty breathing warrant urgent medical care, especially as fever starts to break.",
      },
    ],
  },
  cholera: {
    slug: "cholera",
    lead: "Cholera is a severe diarrheal disease spread through contaminated water or food; outbreaks follow breakdowns in clean water, sanitation, and hygiene.",
    overview:
      "Cholera spreads explosively where infrastructure is stressed by conflict, floods, or displacement. Rapid oral rehydration saves lives; antibiotics play a selective role. Virus Tracker maps regional signals where cholera appears in blended outbreak datasets.",
    transmission:
      "Fecal-oral routes via contaminated water and food; limited person-to-person spread compared to environmental amplification.",
    symptoms:
      "Profuse watery diarrhea and dehydration; severe cases present with shock. Children and malnourished individuals face higher mortality without treatment.",
    prevention:
      "Safe water, sanitation, hygiene promotion, and reactive vaccination campaigns in emergencies. Surveillance of water quality complements case counts.",
    surveillance:
      "Laboratory confirmation and rapid tests improve cluster detection; cross-border notification prevents silent spread along migration corridors.",
    disclaimer: STANDARD_DISCLAIMER,
    seeAlso: [{ label: "Cholera heat map", href: "/map?virus=cholera" }],
    faq: [
      {
        question: "How do people catch cholera?",
        answer:
          "By drinking water or eating food contaminated with the Vibrio cholerae bacterium, usually where sewage has mixed with drinking water supplies.",
      },
      {
        question: "Is there a vaccine for cholera?",
        answer:
          "Yes, oral cholera vaccines exist and are used in reactive campaigns during outbreaks and preventively in high-risk areas, though supply can be limited.",
      },
      {
        question: "How is cholera treated?",
        answer:
          "Prompt oral or intravenous rehydration is the most important treatment and is highly effective. Antibiotics can shorten illness in more severe cases.",
      },
    ],
  },
  mpox: {
    slug: "mpox",
    lead: "Mpox (formerly monkeypox) is a viral illness that causes a distinctive rash; it can spread from animals to people and from person to person through close contact.",
    overview:
      "Clade-specific severity and transmission patterns have shifted historically. Surveillance combines clinical recognition, PCR testing, and contact tracing. Virus Tracker aggregates regional burden snapshots for comparative awareness alongside official case dashboards.",
    transmission:
      "Close skin-to-skin contact, contaminated materials, and zoonotic spillover; respiratory transmission may occur in prolonged close settings per evolving guidance.",
    symptoms:
      "Rash with distinctive progression, lymphadenopathy, fever, and malaise. Immunocompromised patients may experience worse outcomes.",
    prevention:
      "Vaccination where indicated, harm-reduction messaging for sexual health networks, and healthcare IPC for suspect cases.",
    surveillance:
      "Anonymous testing uptake and stigma reduction improve completeness; genomic surveillance tracks importation events.",
    disclaimer: STANDARD_DISCLAIMER,
    seeAlso: [{ label: "Mpox heat map", href: "/map?virus=mpox" }],
    faq: [
      {
        question: "How does mpox spread?",
        answer:
          "Mainly through close, often skin-to-skin contact with an infected person's rash, scabs, or body fluids, and contact with contaminated bedding or clothing. It can also spread from infected animals.",
      },
      {
        question: "Is there a vaccine for mpox?",
        answer:
          "Yes, vaccines originally developed for smallpox offer protection and are recommended for people at higher risk of exposure during outbreaks.",
      },
      {
        question: "How long does mpox illness last?",
        answer:
          "Symptoms typically resolve within two to four weeks. Most cases are managed with supportive care and isolation to prevent further spread.",
      },
    ],
  },
  influenza: {
    slug: "influenza",
    lead: "Seasonal flu causes recurring outbreaks every year, while flu strains that jump from animals to people are watched closely for pandemic risk.",
    overview:
      "Influenza A and B drive winter burdens in temperate zones and more complex seasonality in tropics. Vaccination composition updates follow antigenic drift surveillance. Virus Tracker visualizes regional pressure proxies where open metrics align with syndromic or laboratory reporting.",
    transmission:
      "Droplets and aerosols; high-transmission settings include schools, long-term care facilities, and mass transit during peaks.",
    symptoms:
      "Fever, cough, myalgia, and malaise; complications include pneumonia especially in elderly and high-risk groups.",
    prevention:
      "Annual vaccines, antiviral treatment per guidelines, respiratory etiquette, and workplace sick leave policies.",
    surveillance:
      "Sentinel clinics, lab networks, and global sharing platforms inform vaccine strain selection.",
    disclaimer: STANDARD_DISCLAIMER,
    seeAlso: [{ label: "Influenza heat map", href: "/map?virus=influenza" }],
    faq: [
      {
        question: "How does the flu spread?",
        answer:
          "Mainly through droplets released when an infected person coughs, sneezes, or talks nearby, and by touching contaminated surfaces then the face.",
      },
      {
        question: "Is the flu vaccine worth getting every year?",
        answer:
          "Yes. Flu viruses change often, so vaccines are updated annually to match circulating strains and reduce the risk of severe illness.",
      },
      {
        question: "Who is most at risk of severe flu?",
        answer:
          "Young children, older adults, pregnant women, and people with chronic health conditions face the highest risk of complications like pneumonia.",
      },
    ],
  },
  ebola: {
    slug: "ebola",
    lead: "Ebola virus disease is a severe, often fatal illness controlled through patient isolation, supportive medical care, and close work with affected communities.",
    overview:
      "Outbreaks historically cluster in Central and West Africa with spillover from wildlife reservoirs. Rapid diagnostic deployment and safe burials bend epidemic curves. Virus Tracker provides geographic context for open metrics when mirrored in datasets.",
    transmission:
      "Direct contact with infectious body fluids of symptomatic or deceased patients; healthcare amplification without PPE is a recurring pattern.",
    symptoms:
      "Fever, GI symptoms, hemorrhagic signs in severe disease; early supportive care and fluid management improve survival.",
    prevention:
      "Ring vaccination where available, IPC bundles, community dead-body management protocols, and cross-border coordination.",
    surveillance:
      "Contact tracing coverage and time-to-isolation are operational KPIs beyond case counts alone.",
    disclaimer: STANDARD_DISCLAIMER,
    seeAlso: [{ label: "Ebola heat map", href: "/map?virus=ebola" }],
    faq: [
      {
        question: "How do people catch Ebola?",
        answer:
          "Through direct contact with the blood, secretions, organs, or other body fluids of an infected person or animal, including handling the bodies of people who have died from the disease.",
      },
      {
        question: "Is there a vaccine for Ebola?",
        answer:
          "Yes, an approved vaccine exists for one species of Ebola virus and has been used in ring-vaccination campaigns during outbreaks in West and Central Africa.",
      },
      {
        question: "How deadly is Ebola virus disease?",
        answer:
          "Case-fatality rates have ranged from roughly 25% to 90% across past outbreaks, depending on the virus strain, outbreak response speed, and access to supportive care.",
      },
    ],
  },
  measles: {
    slug: "measles",
    lead: "Measles is one of the most contagious human viruses known; it spreads easily through the air and can cause serious complications, especially in unvaccinated children.",
    overview:
      "Measles is caused by a highly transmissible virus that historically infected nearly every child before vaccines became widely available. Because a single infected person can spread the virus to most susceptible people they encounter, sustained high vaccination coverage is needed to prevent outbreaks. Gaps in immunization, whether from access barriers or vaccine hesitancy, have led to a resurgence of measles in various regions in recent years. Virus Tracker surfaces country-level case activity so readers can see where coverage gaps may be translating into active transmission, alongside the broader context that measles remains preventable with two vaccine doses.",
    transmission:
      "Measles virus spreads through respiratory droplets and can also linger in the air of a room for up to two hours after an infected person leaves. It is one of the most contagious diseases known, capable of infecting around 90% of susceptible close contacts. People are contagious for several days before and after the telltale rash appears, which makes early containment difficult without high population immunity.",
    symptoms:
      "Illness typically begins with high fever, cough, runny nose, and red, watery eyes, followed a few days later by a rash that spreads from the face down the body. Complications can include ear infections, pneumonia, and, less commonly, brain swelling (encephalitis). Malnourished children and infants face the highest risk of severe outcomes.",
    prevention:
      "Two doses of measles-containing vaccine (often combined as MMR) provide strong, long-lasting protection and are the single most effective prevention tool. Maintaining vaccination coverage above roughly 95% in a community helps prevent outbreaks through herd immunity. Rapid outbreak response, including targeted vaccination campaigns, can limit spread once cases appear.",
    surveillance:
      "Measles surveillance relies on case-based reporting, laboratory confirmation, and tracking of vaccination coverage gaps by district. Because outbreaks can grow quickly in under-vaccinated pockets, health agencies prioritize timely case investigation and genomic sequencing to trace transmission chains across borders.",
    disclaimer: STANDARD_DISCLAIMER,
    seeAlso: [{ label: "See Measles on the live map", href: "/map?virus=measles" }],
    faq: [
      {
        question: "How does measles spread?",
        answer:
          "Through the air, via droplets from coughing or sneezing, and the virus can remain infectious in a room for up to two hours after an infected person has left.",
      },
      {
        question: "Is there a vaccine for measles?",
        answer:
          "Yes. Two doses of measles vaccine, usually given as the combined MMR shot, are highly effective and provide long-lasting protection.",
      },
      {
        question: "Why do outbreaks still happen if a vaccine exists?",
        answer:
          "Outbreaks occur where vaccination coverage drops below the level needed for herd immunity, whether due to limited access, disrupted health services, or vaccine hesitancy.",
      },
      {
        question: "Who is most at risk of severe measles?",
        answer:
          "Infants too young to be vaccinated, malnourished children, and people with weakened immune systems face the highest risk of complications like pneumonia and encephalitis.",
      },
    ],
  },
  polio: {
    slug: "polio",
    lead: "Polio is a viral disease that can cause permanent paralysis; decades of vaccination have brought it to the edge of global eradication, but pockets of transmission remain.",
    overview:
      "Poliovirus once paralyzed hundreds of thousands of children annually worldwide. Global vaccination efforts led by WHO, UNICEF, and partners have reduced wild poliovirus to a small number of countries, though outbreaks of vaccine-derived poliovirus can occur in under-immunized communities. Eradication requires closing the last gaps in routine and supplementary immunization, alongside sensitive surveillance for even single cases. Virus Tracker presents available regional signals to support awareness of where transmission risk persists.",
    transmission:
      "Poliovirus spreads mainly through the fecal-oral route, particularly where sanitation is poor, and can also spread via contaminated food or water. It can also spread through respiratory droplets in some settings. Most infections are asymptomatic or mild, which allows the virus to circulate silently before paralytic cases are detected.",
    symptoms:
      "Most infected people have no symptoms or a mild flu-like illness. In a small fraction of cases, the virus invades the nervous system and causes irreversible paralysis, most often in the legs. Paralysis affecting breathing muscles can be life-threatening without medical support.",
    prevention:
      "Oral and inactivated polio vaccines are safe and highly effective, and routine childhood immunization combined with supplementary campaigns is the core strategy for eradication. Maintaining high coverage prevents both wild and vaccine-derived poliovirus from finding susceptible populations to spread within.",
    surveillance:
      "Surveillance centers on detecting acute flaccid paralysis in children and testing stool samples, supplemented by environmental surveillance of sewage in high-risk areas. Because so few infections cause visible paralysis, a single confirmed case signals substantially wider silent circulation.",
    disclaimer: STANDARD_DISCLAIMER,
    seeAlso: [{ label: "See Polio on the live map", href: "/map?virus=polio" }],
    faq: [
      {
        question: "How do people catch polio?",
        answer:
          "Mainly through contact with feces of an infected person, often via contaminated water or food, especially where sanitation is limited.",
      },
      {
        question: "Is there a vaccine for polio?",
        answer:
          "Yes, both oral and injectable polio vaccines exist and are highly effective. Routine childhood immunization has eliminated polio from most of the world.",
      },
      {
        question: "Can polio still cause outbreaks today?",
        answer:
          "Yes, in areas with low vaccination coverage, either from imported wild poliovirus or, rarely, from a mutated form of the weakened virus used in oral vaccines.",
      },
      {
        question: "Is polio curable?",
        answer:
          "There is no cure once paralysis occurs; treatment focuses on supportive care and rehabilitation, which is why prevention through vaccination is so important.",
      },
    ],
  },
  "yellow-fever": {
    slug: "yellow-fever",
    lead: "Yellow fever is a mosquito-borne viral illness that can cause serious liver disease and bleeding; a single vaccine dose offers long-lasting protection.",
    overview:
      "Yellow fever circulates in tropical parts of Africa and South America, cycling between mosquitoes and primates in forested areas before occasionally spilling into human populations near cities. Most infections are mild, but a minority progress to severe disease with high mortality. Because an effective vaccine exists, outbreaks often reflect gaps in vaccination coverage or interruptions in vector control rather than an absence of prevention tools. Virus Tracker highlights regional activity to complement vaccination campaign planning and travel guidance.",
    transmission:
      "Yellow fever virus is transmitted by the bite of infected Aedes or Haemagogus mosquitoes. Two distinct cycles exist: a jungle cycle between mosquitoes and monkeys, and an urban cycle where mosquitoes spread the virus between people, which can fuel larger outbreaks in cities.",
    symptoms:
      "Initial symptoms include fever, chills, headache, muscle pain, and nausea. Most people recover after this phase, but roughly 15% enter a more severe second phase featuring jaundice (the 'yellow' in yellow fever), bleeding, and organ failure, which can be fatal.",
    prevention:
      "A single dose of yellow fever vaccine provides lifelong protection for most people and is required for entry into some countries. Mosquito bite prevention and vector control add additional protection, particularly for unvaccinated travelers to endemic areas.",
    surveillance:
      "Surveillance combines case reporting, laboratory confirmation, and monitoring of vaccination coverage across at-risk regions. International Health Regulations require countries to report confirmed cases promptly given the outbreak potential in unvaccinated urban populations.",
    disclaimer: STANDARD_DISCLAIMER,
    seeAlso: [{ label: "See Yellow Fever on the live map", href: "/map?virus=yellow-fever" }],
    faq: [
      {
        question: "How do people catch yellow fever?",
        answer:
          "Through the bite of an infected mosquito. It cannot spread directly from person to person.",
      },
      {
        question: "Is there a vaccine for yellow fever?",
        answer:
          "Yes, a single dose provides long-lasting, likely lifelong, protection for most people and is required for entry into certain countries.",
      },
      {
        question: "How serious is yellow fever?",
        answer:
          "Most infections are mild, but about 15% of people develop a severe second phase with jaundice and bleeding, which can be fatal in up to half of severe cases.",
      },
      {
        question: "Do I need the vaccine before traveling?",
        answer:
          "Check destination-specific requirements well before travel, since some countries require proof of vaccination and it takes about ten days to become fully effective.",
      },
    ],
  },
  "west-nile-virus": {
    slug: "west-nile-virus",
    lead: "West Nile virus is a mosquito-borne infection that is usually mild but can occasionally cause serious brain inflammation, particularly in older adults.",
    overview:
      "West Nile virus is maintained in nature through a cycle between mosquitoes and birds, with humans and horses as incidental hosts who do not usually pass the virus onward. It has become established across much of the world, including large parts of the United States, Europe, and the Middle East, with case numbers rising in summer and early fall mosquito seasons. Most infections cause no symptoms at all, so the true burden is likely higher than reported case counts suggest. Virus Tracker surfaces regional activity where open data mirrors seasonal surveillance reports.",
    transmission:
      "The virus is transmitted by the bite of an infected Culex mosquito, which becomes infected after feeding on a bird carrying the virus. Rare transmission has occurred through blood transfusion, organ transplant, and from mother to child, but mosquito bites remain the overwhelming source of infection.",
    symptoms:
      "About 80% of infected people have no symptoms. Roughly 20% develop fever, headache, body aches, and sometimes a rash, usually resolving within about a week. Less than 1% develop severe neurological illness, such as encephalitis or meningitis, which is more common in older adults and people with weakened immune systems.",
    prevention:
      "There is no vaccine for humans, so prevention relies on avoiding mosquito bites through repellent use, protective clothing, and eliminating standing water where mosquitoes breed. Community mosquito control programs help reduce vector populations during peak transmission season.",
    surveillance:
      "Surveillance often combines human case reporting with mosquito trapping and testing, and monitoring of bird die-offs, which can serve as an early warning sign of virus activity in an area before human cases appear.",
    disclaimer: STANDARD_DISCLAIMER,
    seeAlso: [{ label: "See West Nile Virus on the live map", href: "/map?virus=west-nile-virus" }],
    faq: [
      {
        question: "How do people catch West Nile virus?",
        answer:
          "Through the bite of an infected mosquito that has previously fed on a bird carrying the virus. It does not spread directly between people through casual contact.",
      },
      {
        question: "Is there a vaccine for West Nile virus?",
        answer:
          "No vaccine for humans currently exists. Prevention relies on avoiding mosquito bites and reducing mosquito breeding sites.",
      },
      {
        question: "What are the symptoms of West Nile virus?",
        answer:
          "Most infected people have no symptoms. Those who do may experience fever, headache, and body aches; a small fraction develop serious neurological illness.",
      },
      {
        question: "Who is at highest risk of severe illness?",
        answer:
          "Adults over 60 and people with weakened immune systems or certain chronic conditions face the highest risk of developing encephalitis or meningitis.",
      },
    ],
  },
  rsv: {
    slug: "rsv",
    lead: "RSV is a common respiratory virus that causes cold-like illness in most people but can be dangerous for infants and older adults.",
    overview:
      "Respiratory syncytial virus (RSV) circulates widely every year, typically peaking in colder months in temperate climates. Nearly all children are infected at least once by age two, and reinfection throughout life is common because immunity is incomplete. While most cases resemble a common cold, RSV is a leading cause of hospitalization in infants and can cause serious illness in older adults, particularly those with chronic heart or lung disease. Recent approvals of vaccines and preventive antibody treatments mark a shift in how RSV risk can be managed for the most vulnerable groups. Virus Tracker tracks regional activity where seasonal reporting is available.",
    transmission:
      "RSV spreads through respiratory droplets from coughing and sneezing, and through direct contact with a contaminated surface followed by touching the eyes, nose, or mouth. It spreads efficiently in households, schools, and childcare settings, and can survive on hard surfaces for several hours.",
    symptoms:
      "Most people experience mild, cold-like symptoms including runny nose, cough, and low-grade fever. In infants and young children, RSV can progress to bronchiolitis or pneumonia with wheezing and difficulty breathing. Older adults and people with weakened immune systems can also develop severe lower respiratory illness.",
    prevention:
      "Vaccines are now available for older adults and pregnant women, and a long-acting preventive antibody can be given to infants. General measures include hand hygiene, avoiding close contact while symptomatic, and cleaning frequently touched surfaces, especially around infants and older relatives.",
    surveillance:
      "RSV surveillance typically relies on sentinel laboratory testing and hospitalization tracking, often reported alongside influenza data during shared respiratory virus seasons. Trends help hospitals anticipate pediatric bed demand during seasonal peaks.",
    disclaimer: STANDARD_DISCLAIMER,
    seeAlso: [{ label: "See RSV on the live map", href: "/map?virus=rsv" }],
    faq: [
      {
        question: "How does RSV spread?",
        answer:
          "Through droplets from coughing or sneezing and by touching contaminated surfaces then the face. It spreads easily in households and childcare settings.",
      },
      {
        question: "Is there a vaccine for RSV?",
        answer:
          "Yes, vaccines are now approved for older adults and for pregnant women to protect their newborns, and a preventive antibody shot is available for infants.",
      },
      {
        question: "Why is RSV especially risky for babies?",
        answer:
          "Infants have smaller airways that can become blocked by inflammation and mucus, making RSV a leading cause of infant hospitalization for bronchiolitis and pneumonia.",
      },
      {
        question: "Can adults get RSV more than once?",
        answer:
          "Yes. Immunity from a previous infection fades over time, so reinfection throughout life is common, though later infections are often milder than the first.",
      },
    ],
  },
  norovirus: {
    slug: "norovirus",
    lead: "Norovirus is a highly contagious stomach bug that causes sudden vomiting and diarrhea, and it spreads easily in close-contact settings like cruise ships and care homes.",
    overview:
      "Norovirus is one of the leading causes of acute gastroenteritis worldwide, notorious for causing rapid, explosive outbreaks in settings where people are in close quarters. It is extremely contagious, with a very small amount of virus enough to cause infection, and it can persist on surfaces and resist many common disinfectants. Illness is usually short-lived but unpleasant, and outbreaks can disrupt schools, hospitals, and travel. Virus Tracker surfaces available seasonal signals to support situational awareness.",
    transmission:
      "Norovirus spreads through contaminated food or water, contact with an infected person, or touching contaminated surfaces and then the mouth. Infected people shed large amounts of virus in vomit and stool, and can remain contagious for days after symptoms resolve.",
    symptoms:
      "Sudden onset of vomiting and watery diarrhea are hallmark symptoms, often accompanied by stomach cramps, nausea, and low-grade fever. Symptoms usually last one to three days, but dehydration is a risk, especially for young children and older adults.",
    prevention:
      "Thorough handwashing with soap and water is more effective than alcohol-based sanitizer against norovirus. Surface cleaning with bleach-based disinfectants, safe food handling, and staying home while symptomatic and for a couple of days after help limit spread.",
    surveillance:
      "Outbreak surveillance relies on reports from healthcare facilities, schools, and food safety authorities, along with laboratory confirmation of clusters. Seasonal patterns typically peak in cooler months in temperate regions.",
    disclaimer: STANDARD_DISCLAIMER,
    seeAlso: [{ label: "See Norovirus on the live map", href: "/map?virus=norovirus" }],
    faq: [
      {
        question: "How does norovirus spread?",
        answer:
          "Through contaminated food or water, direct contact with an infected person, and touching contaminated surfaces before touching the mouth. It spreads very easily because only a tiny amount of virus is needed to cause infection.",
      },
      {
        question: "Is there a vaccine for norovirus?",
        answer:
          "No vaccine is currently approved for general use, though candidates are in development. Prevention relies on hygiene and sanitation.",
      },
      {
        question: "How long does norovirus illness last?",
        answer:
          "Symptoms typically resolve within one to three days, but people can remain contagious for a few days after feeling better.",
      },
      {
        question: "Does hand sanitizer protect against norovirus?",
        answer:
          "Alcohol-based hand sanitizer is less effective against norovirus than thorough handwashing with soap and water, which is the recommended precaution.",
      },
    ],
  },
  mers: {
    slug: "mers",
    lead: "MERS is a severe respiratory illness linked to camels that has caused sporadic outbreaks, mostly on the Arabian Peninsula, with a notably high fatality rate.",
    overview:
      "Middle East respiratory syndrome (MERS) is caused by a coronavirus distinct from SARS-CoV-2. Since its identification, cases have been reported mainly in countries on or near the Arabian Peninsula, with occasional travel-related cases elsewhere. Dromedary camels are a known reservoir and source of spillover infections, and healthcare settings have been the site of significant transmission clusters when infection control lapses. The high case-fatality rate observed in confirmed cases keeps MERS on the list of pathogens prioritized for pandemic preparedness research. Virus Tracker presents regional signals where open data is available.",
    transmission:
      "Human infections are often linked to direct or indirect contact with infected dromedary camels or camel products such as unpasteurized milk. Human-to-human transmission occurs mainly through close contact, especially in healthcare settings without adequate infection prevention and control measures.",
    symptoms:
      "Typical illness includes fever, cough, and shortness of breath, which can progress to pneumonia and, in many severe cases, respiratory failure. Gastrointestinal symptoms sometimes occur. People with underlying health conditions face substantially higher risk of severe outcomes.",
    prevention:
      "Avoiding unprotected contact with camels and unpasteurized camel products in affected regions reduces spillover risk. Rigorous infection prevention and control in healthcare facilities is critical to prevent the hospital-based clusters seen in past outbreaks. No vaccine is yet licensed for general use.",
    surveillance:
      "Surveillance combines human case reporting with camel and environmental monitoring in endemic areas. Rapid identification and isolation of suspect cases in hospitals has been central to controlling past clusters.",
    disclaimer: STANDARD_DISCLAIMER,
    seeAlso: [{ label: "See MERS on the live map", href: "/map?virus=mers" }],
    faq: [
      {
        question: "How do people catch MERS?",
        answer:
          "Often through contact with infected camels or unpasteurized camel milk in affected regions. It can also spread between people, particularly in healthcare settings without strong infection control.",
      },
      {
        question: "Is there a vaccine for MERS?",
        answer:
          "No vaccine is currently licensed for general public use, though candidates have been studied in clinical trials.",
      },
      {
        question: "How deadly is MERS?",
        answer:
          "Confirmed cases have had a case-fatality rate of roughly 35%, though this may be an overestimate since milder infections are likely underdiagnosed.",
      },
      {
        question: "Where does MERS mostly occur?",
        answer:
          "The large majority of cases have been reported in Saudi Arabia and other countries on or near the Arabian Peninsula, with occasional cases linked to travel elsewhere.",
      },
    ],
  },
  rabies: {
    slug: "rabies",
    lead: "Rabies is a virus that attacks the brain and is almost always fatal once symptoms begin, but it is entirely preventable with prompt treatment after a bite.",
    overview:
      "Rabies is transmitted through the saliva of infected mammals, most often dogs in regions where canine rabies has not been eliminated through vaccination. The disease has one of the highest case-fatality rates of any infection once clinical symptoms appear, but timely post-exposure treatment after a bite or scratch is nearly 100% effective at preventing illness. Most human deaths occur in parts of Africa and Asia where access to post-exposure treatment is limited and dog vaccination coverage remains incomplete. Virus Tracker presents available regional context to support awareness of exposure risk.",
    transmission:
      "The virus is transmitted through the saliva of an infected animal, typically via a bite, though scratches or licks on broken skin or mucous membranes can also transmit it. Dogs cause the large majority of human cases globally, though bats, raccoons, foxes, and other mammals can also transmit rabies.",
    symptoms:
      "Early symptoms include fever, tingling or pain at the wound site, and general weakness, progressing to anxiety, confusion, agitation, and eventually paralysis and coma. Once symptoms appear, the disease is almost always fatal, which is why treatment before symptom onset is critical.",
    prevention:
      "Prompt wound washing with soap and water and post-exposure prophylaxis, which includes vaccine doses and sometimes rabies immunoglobulin, prevents illness if given soon after exposure. Vaccinating dogs at the community level is the most effective way to reduce human rabies deaths at the population level. Pre-exposure vaccination is recommended for people at occupational or travel-related risk.",
    surveillance:
      "Surveillance combines animal bite reporting, laboratory confirmation in suspected animal and human cases, and tracking of dog vaccination coverage. Because rabies is nearly always fatal once symptomatic, most public health effort focuses on preventing exposure and ensuring access to post-exposure treatment.",
    disclaimer: STANDARD_DISCLAIMER,
    seeAlso: [{ label: "See Rabies on the live map", href: "/map?virus=rabies" }],
    faq: [
      {
        question: "What should I do if bitten by an animal that might have rabies?",
        answer:
          "Wash the wound thoroughly with soap and water immediately and seek medical care right away to begin post-exposure treatment, which is highly effective if started promptly.",
      },
      {
        question: "Is there a vaccine for rabies?",
        answer:
          "Yes. Both preventive (pre-exposure) vaccination and post-exposure treatment after a bite are available and are highly effective at preventing illness.",
      },
      {
        question: "Is rabies always fatal?",
        answer:
          "Once symptoms begin, rabies is almost always fatal. That is why treatment before symptoms appear, right after a bite or scratch, is so important.",
      },
      {
        question: "Which animals carry rabies?",
        answer:
          "Dogs cause most human cases worldwide, but bats, raccoons, foxes, and other mammals can also carry and transmit the virus depending on the region.",
      },
    ],
  },
  "hepatitis-a": {
    slug: "hepatitis-a",
    lead: "Hepatitis A is a liver infection spread through contaminated food or water; it usually resolves on its own and is preventable with a vaccine.",
    overview:
      "Hepatitis A virus causes acute liver inflammation and spreads readily in settings with inadequate sanitation or during person-to-person outbreaks among close-contact networks. Unlike hepatitis B or C, it does not cause chronic infection, and most people recover fully within weeks to months. Outbreaks can still strain healthcare systems, particularly among vulnerable populations such as people experiencing homelessness or in areas recovering from natural disasters. Virus Tracker presents available regional signals where open outbreak data exists.",
    transmission:
      "The virus spreads primarily through the fecal-oral route, via contaminated food or water, or close personal contact with an infected person. Outbreaks have been linked to contaminated produce, shellfish, and inadequate sanitation, as well as to person-to-person spread in certain social networks.",
    symptoms:
      "Symptoms can include fatigue, nausea, abdominal pain, loss of appetite, and jaundice, though young children often have mild or no symptoms. Illness typically resolves within a few weeks, though recovery can occasionally take longer. Severe liver failure is rare but possible, especially in older adults or people with existing liver disease.",
    prevention:
      "A safe and effective vaccine provides long-term protection and is recommended for children, travelers to endemic areas, and people at higher occupational or behavioral risk. Safe water and food handling, along with good hand hygiene, further reduce transmission risk.",
    surveillance:
      "Surveillance relies on case reporting and outbreak investigation, often tracing sources back to specific food items, water supplies, or social networks. Vaccination coverage tracking helps identify communities at higher risk of outbreaks.",
    disclaimer: STANDARD_DISCLAIMER,
    seeAlso: [{ label: "See Hepatitis A on the live map", href: "/map?virus=hepatitis-a" }],
    faq: [
      {
        question: "How do people catch hepatitis A?",
        answer:
          "Mainly by eating or drinking something contaminated with the virus, or through close personal contact with an infected person, especially where sanitation is limited.",
      },
      {
        question: "Is there a vaccine for hepatitis A?",
        answer:
          "Yes, a safe and effective vaccine provides long-lasting protection and is recommended for children, travelers, and people at higher risk.",
      },
      {
        question: "Does hepatitis A become a chronic infection?",
        answer:
          "No. Unlike hepatitis B or C, hepatitis A does not cause long-term chronic liver infection; most people recover fully within weeks to a couple of months.",
      },
      {
        question: "Can hepatitis A be serious?",
        answer:
          "Most cases resolve without lasting harm, but severe liver failure can occur rarely, particularly in older adults or people with pre-existing liver disease.",
      },
    ],
  },
  oropouche: {
    slug: "oropouche",
    lead: "Oropouche is a virus spread mainly by tiny biting midges that has caused growing outbreaks in the Americas, usually causing dengue-like fever.",
    overview:
      "Oropouche virus circulates in parts of South and Central America and the Caribbean, historically causing periodic urban outbreaks with symptoms that closely resemble dengue, chikungunya, and Zika, which complicates diagnosis. Cases have expanded into new areas in recent years, drawing renewed attention from regional health authorities. Because it is spread by a tiny biting midge rather than a mosquito, standard mosquito-control programs may not fully address transmission risk. Virus Tracker highlights available regional signals to support comparative situational awareness alongside other arboviral diseases.",
    transmission:
      "The primary vector is a tiny biting midge (Culicoides paraensis), though some mosquito species may also play a role in transmission. Emerging evidence also suggests possible transmission from a pregnant woman to her fetus, prompting increased monitoring during pregnancy.",
    symptoms:
      "Illness typically includes fever, severe headache, muscle and joint pain, chills, and sometimes nausea and rash, closely resembling dengue and other arboviral infections. Most cases resolve within about a week, though some people experience recurring symptoms afterward. Rare severe outcomes, including possible links to adverse pregnancy outcomes, are under active investigation.",
    prevention:
      "There is no vaccine, so prevention relies on avoiding bites from midges and mosquitoes through repellent use, protective clothing, and fine-mesh screening, since standard mosquito netting may not block the smaller midge vector. Pregnant travelers to affected areas may wish to take extra precautions given ongoing research into pregnancy risk.",
    surveillance:
      "Surveillance depends on clinical suspicion combined with laboratory testing, since symptoms overlap heavily with other arboviral diseases circulating in the same regions. Expanding laboratory capacity and genomic sequencing have helped confirm the geographic spread of recent outbreaks.",
    disclaimer: STANDARD_DISCLAIMER,
    seeAlso: [{ label: "See Oropouche on the live map", href: "/map?virus=oropouche" }],
    faq: [
      {
        question: "How do people catch Oropouche virus?",
        answer:
          "Mainly through the bite of a tiny biting midge, though some mosquitoes may also transmit it. It is not known to spread directly between people through casual contact.",
      },
      {
        question: "Is there a vaccine for Oropouche?",
        answer:
          "No vaccine currently exists. Prevention relies on avoiding bites from midges and mosquitoes.",
      },
      {
        question: "How is Oropouche different from dengue?",
        answer:
          "The symptoms look very similar, which makes clinical diagnosis difficult without lab testing. The key practical difference is the vector: Oropouche spreads mainly through tiny midges rather than mosquitoes.",
      },
      {
        question: "Is Oropouche a concern during pregnancy?",
        answer:
          "Researchers are actively studying possible links between Oropouche infection during pregnancy and adverse outcomes, so pregnant travelers to affected areas are advised to take extra precaution.",
      },
    ],
  },
};

export function getVirusWiki(slug: string): VirusWikiContent | null {
  return isVirusSlug(slug) ? (REGISTRY[slug] ?? null) : null;
}

export function getVirusWikiFallback(name: string, summary: string): VirusWikiContent {
  return {
    slug: "generic",
    lead: `${name}: ${summary}`,
    overview: `${summary} This page summarizes live regional metrics and visual analytics available in Virus Tracker. Consult authoritative health agencies for clinical and policy guidance.`,
    transmission:
      "Transmission routes depend on the specific pathogen. Review pathogen-specific guidance from WHO, CDC, or your national public health institute for authoritative detail.",
    symptoms:
      "Symptom profiles vary. Seek professional medical evaluation for concerning symptoms rather than relying on dashboards alone.",
    prevention:
      "Prevention strategies are pathogen-specific and may include vaccines, vector control, hygiene, PPE, and behavioral risk reduction. Follow local recommendations.",
    surveillance:
      "Surveillance systems combine laboratory, clinical, and environmental data. Open datasets may lag or omit regions with limited reporting capacity.",
    disclaimer: STANDARD_DISCLAIMER,
  };
}
