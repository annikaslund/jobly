process.env.NODE_ENV = "test";
const sqlForPartialUpdate = require("../../helpers/partialUpdate")

// const app = require("../app");

// const db = require("../db");

describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
      function () {
    expect(sqlForPartialUpdate('testCompany', {'testKey': 'testValue'}, 'testKey', 1))
      .toEqual({'query': `UPDATE testCompany SET testKey=$1 WHERE testKey=$2 RETURNING *`,
            'values': ['testValue', 1]})
  });
});
