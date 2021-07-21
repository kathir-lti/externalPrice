import {createBaselineActionTests} from '@oracle-cx-commerce/test/unit/actions';
import * as exportedActions from '../../index';
import actions from '../index';

const expectedActions = ['addItemsToCart'];

// Run a standard series of tests to verify basic functionality of our defined actions.
createBaselineActionTests({actions, expectedActions, exportedActions});
