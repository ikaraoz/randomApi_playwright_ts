export const paramsExamples = {
  female: { gender: 'female' },
  male: { gender: 'male' },
  genderInvalid: { gender: 'not-a-valid-value', results: 20 },

  results: { results: 10 },

  passwordSimple: { password: 'upper,lower,1-16' },
  passwordSpecial: { password: 'special,32' },
  passwordComplex: { password: 'special,upper,lower,number' },

  natMulti: { nat: 'us,dk,fr,gb', results: 20 },
  includeBasic: { inc: 'gender,name,nat', results: 5 },
  excludeLogin: { exc: 'login', results: 5 },
} as const;
