SELECT DISTINCT qr.QuestionerID from QResponses qr
JOIN Questions q on q.QID = qr.QID
JOIN QTypes qt on qt.QTypeID = q.QTypeID
where qt.DisplayDefinition like '%scale%' AND qt.DisplayDefinition LIKE '%header_line%line%line%'
order BY qr.QuestionerID