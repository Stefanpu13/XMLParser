var renderersCommon = renderersCommon || {},
    utils = utils || {}; // namespace declaration in different classes
renderersCommon.constants = {
    DISPLAY_TYPE_SCALE: "scale",
    DISPLAY_TYPE_LABEL: "label",
    DISPLAY_TYPE_TEXT: "text",
    DISPLAY_TYPE_RADIO: "radio_group",
    DISPLAY_VERTICAL_GROUP: "vertical_group",
    DISPLAY_TYPE_DROPDOWN: "drop_box",
    DISPLAY_TYPE_DATE: "date",
    DISPLAY_TYPE_DATADROPDOWN: "data_dropdown",
    DISPLAY_TYPE_CASCADEDROPDOWN: "cascade_dropdown",
    EXTERNAL_REF: 'ExternalRef',
    Q_TEXT: 'QText',
    RETURN_ANSWER: 'data-return-answer',
    // Custom attribute to be added to the different answer options.
    // #region custom attributes
    ANSWER_ATTRIBUTE: "data-answer-value",
    COLUMNS_COUNT_ATTTRIBUTE: 'data-columns-count',
    DYNAMIC_SELECT_CLASS_NAME: 'dynamic-select',
    VERTICAL_GROUP_CELL_CONTENT_TYPE: 'verical group',
    ROW_CLASS: 'form-question-row',
    SCALE_ROW_CLASS: 'scale-row',
    RADIO_ROW_CLASS:'radio-row',
    TEXT_ROW_CLASS:'text-row',
    VERTICAL_GROUP_ROW_CLASS:'vertical-group-row',
    DATE_ROW_CLASS:'date-row',
    DROPDOWN_ROW_CLASS:'dropdown-row',
    LABEL_ROW_CLASS: 'label-row',
    INNER_TABLE_SCALE_ROW: 'inner-table-scale-row',
    DATA_SCALEID:'data-scaleid',
    // #endregion        
    forEach: Array.prototype.forEach,
    baseUrl: (utils && utils.baseServiceAddress && utils.baseServiceAddress()) || 'http://localhost:61008/api/'
};