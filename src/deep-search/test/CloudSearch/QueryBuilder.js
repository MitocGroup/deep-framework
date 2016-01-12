// THIS TEST WAS GENERATED AUTOMATICALLY ON Tue Jan 12 2016 16:52:06 GMT+0200 (EET)

'use strict';

import chai from 'chai';
import {QueryBuilder} from '../../lib.compiled/CloudSearch/QueryBuilder';

// @todo: Add more advanced tests
suite("CloudSearch/QueryBuilder", function() {
  test('Class QueryBuilder exists in CloudSearch/QueryBuilder', function() {
    chai.expect(typeof QueryBuilder).to.equal('function');
  });

  test('General QueryBuilder test', function() {
    let qb = new QueryBuilder();

    qb
      .query((query) => {
        query.query('some query');
      })
      .filterQuery("updatedAt:''")
      .queryOptions((queryOptions) => {
        queryOptions.field('title', 3);
      })
      .highlight('title', (highlight) => {
        highlight.maxOccurrences(2).plain();
      })
      .facet('createdAt', (facet) => {
        facet.sortByValue().top(10);
      })
      .size(10)
      .offset(2)
      .expr('(0.3*createdAt)+(0.7*_score)')
      .addExpr('(0.3*createdAt)+(0.7*_score)', 'expr2')
      .sortBy('title', 'asc')
      .sortBy('createdAt', 'desc')
      .returnFields('title', 'description')
      .returnScore()
      .partial()
    ;

    chai.expect(qb.searchPayload).to.deep.equal({
      queryParser: 'simple',
      query: 'some query',
      size: 10,
      start: 2,
      sort: 'title asc,createdAt desc',
      expr: '{"expression1":"(0.3*createdAt)+(0.7*_score)","expr2":"(0.3*createdAt)+(0.7*_score)"}',
      facet: '{"createdAt":{"sort":"bucket","size":10}}',
      highlight: '{"title":{"max_phrases":2,"format":"text"}}',
      partial: true,
      queryOptions: '{"fields":["title^3"]}',
      'return': 'title,description,_score',
      filterQuery: 'updatedAt:\'\''
    });

    qb.useCursor();

    chai.expect(qb.searchPayload).to.deep.equal({
      queryParser: 'simple',
      query: 'some query',
      size: 10,
      cursor: 'initial',
      sort: 'title asc,createdAt desc',
      expr: '{"expression1":"(0.3*createdAt)+(0.7*_score)","expr2":"(0.3*createdAt)+(0.7*_score)"}',
      facet: '{"createdAt":{"sort":"bucket","size":10}}',
      highlight: '{"title":{"max_phrases":2,"format":"text"}}',
      partial: true,
      queryOptions: '{"fields":["title^3"]}',
      'return': 'title,description,_score',
      filterQuery: 'updatedAt:\'\''
    });
  });
});
