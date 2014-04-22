SELECT DISTINCT qr.QuestionerID from QResponses qr
JOIN Questions q on q.QID = qr.QID
JOIN QTypes qt on qt.QTypeID = q.QTypeID
where qt.DisplayDefinition like '%incomplete_row value="start"%'
union
SELECT DISTINCT qr.QuestionerID from QResponses qr
JOIN Questions q on q.QID = qr.QID
JOIN QTypes qt on qt.QTypeID = q.QTypeID
where qt.DisplayDefinition like '%incomplete_row value="end"%'
order BY qr.QuestionerID
