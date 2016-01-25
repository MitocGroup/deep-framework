// THIS TEST WAS GENERATED AUTOMATICALLY ON Tue Jan 12 2016 16:52:06 GMT+0200 (EET)

'use strict';

import chai from 'chai';
import {Builder} from '../../../lib.compiled/CloudSearch/QueryBuilder/Builder';

// @todo: Add more advanced tests
suite("CloudSearch/QueryBuilder/Builder", function() {
  test('Class Builder exists in CloudSearch/QueryBuilder/Builder', function() {
    chai.expect(typeof Builder).to.equal('function');
  });

  test('General Builder test', function() {
    let qb = new Builder();

    qb
      .query((query) => {
        query.query('some title query');
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

    chai.expect(qb.generateSearchPayload()).to.deep.equal({
      queryParser: 'simple',
      query: 'some title query',
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

    chai.expect(qb.generateSearchPayload()).to.deep.equal({
      queryParser: 'simple',
      query: 'some title query',
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

    chai.expect(qb.generateSearchPayload({title: 'titleReplaced',})).to.deep.equal({
      queryParser: 'simple',
      query: 'some titleReplaced query',
      size: 10,
      cursor: 'initial',
      sort: 'titleReplaced asc,createdAt desc',
      expr: '{"expression1":"(0.3*createdAt)+(0.7*_score)","expr2":"(0.3*createdAt)+(0.7*_score)"}',
      facet: '{"createdAt":{"sort":"bucket","size":10}}',
      highlight: '{"titleReplaced":{"max_phrases":2,"format":"text"}}',
      partial: true,
      queryOptions: '{"fields":["titleReplaced^3"]}',
      'return': 'titleReplaced,description,_score',
      filterQuery: 'updatedAt:\'\''
    });
  });
});
