const axios = require('axios');

const gsoc_years = [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016];

const apiUrl = `https://api.gsocorganizations.dev`;

const getOrgs = async (year) => {
  try {
    const { data } = await axios.get(`${apiUrl}/${year}.json`);
    return { year, orgs: data.organizations };
  } catch (err) {
    console.log('err', err);
  }
};

const trace = {};
let topics = {};

let orgWithJs = {};
Promise.allSettled(gsoc_years.map((year) => getOrgs(year)))
  .then((yearOrgs) => {
    yearOrgs.forEach(({ value: { orgs, year } }) => {
      orgs.forEach((org) => {
        org.technologies.forEach((t) => {
          if (trace[t]) trace[t].count++;
          else trace[t] = { count: 1 };
          if (t.toLowerCase() == 'javascript') {
            if (!orgWithJs[year]) orgWithJs[year] = [];
            orgWithJs[year].push(org);
          }
          if (topics[t]) topics[t].count++;
          else topics[t] = { count: 1 };
        });
      });
    });
    // console.log(Array.from(new Set(tmp.flat(Infinity))));
    // console.log(
    //   Object.fromEntries(
    //     Object.entries(trace).sort((a, b) => b.count - a.count)
    //   )
    // );
    // console.log(
    //   Object.fromEntries(
    //     Object.entries(topics).sort((a, b) => b.count - a.count)
    //   )
    // );
    let tmp = {};
    Object.keys(orgWithJs).map((year) => {
      if (!tmp[year]) tmp[year] = {};
      tmp[year] = orgWithJs[year].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      );
    });

    let refine = {};
    Object.keys(tmp).forEach((year) => {
      if (!refine[year]) refine[year] = [];
      refine[year].push(tmp[year].map((t) => t.name));
    });
    // function findCommonElements(arr1, arr2) {
    //   return arr1.filter((value) => arr2.includes(value));
    // }

    // const years = Object.keys(refine);
    // let commonElements = refine[years[0]][0].slice(); // Start with the array from the first year

    // for (let i = 1; i < years.length; i++) {
    //   const currentYear = years[i];
    //   commonElements = findCommonElements(
    //     commonElements,
    //     refine[currentYear][0]
    //   );
    // }

    // console.log('Common elements from 2016 to 2023:');
    // console.log(commonElements);
    findCommons(refine);
  })

  .catch((err) => {
    console.log('err frompromise', err);
  });

const findCommons = (obj) => {
  function findCommonElements(arr1, arr2) {
    return arr1.filter((value) => arr2.includes(value));
  }

  const years = Object.keys(obj);

  for (let i = 0; i < years.length - 1; i++) {
    const currentYear = years[i];
    const nextYear = years[i + 1];

    const commonElements = findCommonElements(
      obj[currentYear][0],
      obj[nextYear][0]
    );

    console.log(`Common elements between ${currentYear} and ${nextYear}:`);
    console.log(commonElements);
  }
};
