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

const REGISTRY: Record<string, VirusWikiContent> = {
  "covid-19": {
    slug: "covid-19",
    lead: "COVID-19 is respiratory disease caused by SARS-CoV-2. Global surveillance tracks cases, severity, and regional pressure to highlight emerging waves and healthcare stress.",
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
    ],
  },
  zika: {
    slug: "zika",
    lead: "Zika virus is a mosquito-borne flavivirus associated with outbreaks in tropical and subtropical regions; surveillance focuses on vectors, travel-related cases, and congenital risk signals.",
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
  },
  chikungunya: {
    slug: "chikungunya",
    lead: "Chikungunya virus causes fever and often debilitating joint pain; outbreaks follow Aedes-borne transmission and can stress outpatient services during peaks.",
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
  },
  nipah: {
    slug: "nipah",
    lead: "Nipah virus is a zoonotic paramyxovirus with high case-fatality risk; outbreaks are often linked to bats, pigs, or contaminated food products in South and Southeast Asia.",
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
  },
  "avian-influenza-h5n1": {
    slug: "avian-influenza-h5n1",
    lead: "Highly pathogenic avian influenza A(H5N1) primarily affects poultry and wild birds; sporadic human infections raise pandemic preparedness attention.",
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
  },
  "lassa-fever": {
    slug: "lassa-fever",
    lead: "Lassa fever is an arenavirus hemorrhagic fever endemic in parts of West Africa, associated with rodent reservoirs and nosocomial spread risk.",
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
  },
  marburg: {
    slug: "marburg",
    lead: "Marburg virus causes severe viral hemorrhagic fever; outbreaks require rapid contact tracing, safe burials, and strict infection prevention and control.",
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
  },
  hantavirus: {
    slug: "hantavirus",
    lead: "Hantaviruses cause hemorrhagic fever with renal syndrome and hantavirus pulmonary syndrome depending on region; exposure often follows aerosolized rodent excreta.",
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
  },
  dengue: {
    slug: "dengue",
    lead: "Dengue is the most common mosquito-borne viral disease globally; repeated infections increase risk of severe dengue in some individuals.",
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
  },
  cholera: {
    slug: "cholera",
    lead: "Cholera is acute diarrheal disease caused by toxigenic Vibrio cholerae; outbreaks track unsafe water, sanitation, and hygiene failures.",
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
  },
  mpox: {
    slug: "mpox",
    lead: "Mpox (monkeypox) is orthopoxvirus disease with zoonotic reservoirs and human-to-human transmission; outbreak dynamics vary by network contacts and vaccination coverage.",
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
  },
  influenza: {
    slug: "influenza",
    lead: "Seasonal influenza viruses cause recurrent epidemics; zoonotic influenza subtypes remain under global watch for pandemic potential.",
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
  },
  ebola: {
    slug: "ebola",
    lead: "Ebola virus disease is severe filovirus illness managed through isolation, supportive care, and community-engaged response.",
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
  },
};

export function getVirusWiki(slug: string): VirusWikiContent | null {
  return REGISTRY[slug] ?? null;
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
