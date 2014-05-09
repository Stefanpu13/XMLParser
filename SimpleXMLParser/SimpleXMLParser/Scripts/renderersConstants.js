var renderersCommon = renderersCommon || {}; // namespace declaration in different classes
renderersCommon.constants = {
    DISPLAY_TYPE_SCALE : "scale",
    DISPLAY_TYPE_LABEL : "label",
    DISPLAY_TYPE_TEXT : "text",
    DISPLAY_TYPE_RADIO : "radio_group",
    DISPLAY_VERTICAL_GROUP : "vertical_group",
    DISPLAY_TYPE_DROPDOWN : "drop_box",
    DISPLAY_TYPE_DATE : "date",
    DISPLAY_TYPE_DATADROPDOWN : "data_dropdown",
    DISPLAY_TYPE_CASCADEDROPDOWN : "cascade_dropdown",
    EXTERNAL_REF : 'ExternalRef',
    Q_TEXT : 'QText',
    RETURN_ANSWER : 'data-return-answer',    
    // Custom attribute to be added to the different answer options.
    // #region custom attributes
    ANSWER_ATTRIBUTE : "data-answer-value",
    COLUMNS_COUNT_ATTTRIBUTE: 'data-columns-count',
    DYNAMIC_SELECT_CLASS_NAME: 'dynamic-select',
    // #endregion        
    forEach: Array.prototype.forEach  
};