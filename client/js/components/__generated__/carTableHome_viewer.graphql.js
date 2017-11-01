/**
 * @flow
 */

/* eslint-disable */

'use strict';

/*::
import type {ConcreteFragment} from 'relay-runtime';
export type carTableHome_viewer = {|
  +id: string;
|};
*/


const fragment /*: ConcreteFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "carTableHome_viewer",
  "selections": [
    {
      "kind": "ScalarField",
      "alias": null,
      "args": null,
      "name": "id",
      "storageKey": null
    },
    {
      "kind": "FragmentSpread",
      "name": "paginatedCarTable_viewer",
      "args": null
    }
  ],
  "type": "Viewer"
};

module.exports = fragment;
