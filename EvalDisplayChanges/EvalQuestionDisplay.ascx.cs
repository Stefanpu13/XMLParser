using System;
using System.Data;
using System.Configuration;
using System.Collections;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.Xml;
using System.Collections.Generic;


using SystemArts.VersantRN;
using SystemArts.VersantRN.BusinessLogicLayer;
using SystemArts.VersantRN.Data;
using System.Reflection;
using System.IO;


public partial class EvalQuestionDisplay : SystemArts.VersantRN.WebUI.UserControlBase
{
    #region Constants
    //Display Type constants
    const string DISPLAY_TYPE_SCALE = "scale";
    const string DISPLAY_TYPE_LABEL = "label";
    const string DISPLAY_TYPE_TEXT = "text";
    const string DISPLAY_TYPE_RADIO = "radio_group";
    const string DISPLAY_VERTICAL_GROUP = "vertical_group";
    const string DISPLAY_TYPE_DROPDOWN = "drop_box";
    const string DISPLAY_TYPE_DATE = "date";
    const string DISPLAY_TYPE_YYMM = "yy-mm";
    const string DISPLAY_TYPE_DATADROPDOWN = "data_dropdown";
    const string DISPLAY_TYPE_CASCADEDROPDOWN = "cascade_dropdown";

    //Question Type constants
    const string QUESTION_TYPE_ACTIVE = "active";
    const string QUESTION_TYPE_PASSIVE = "passive";

    //Direction
    const string DIRECTION_HORIZONTAL = "horizontal";
    const string DIRECTION_VERTICAL = "vertical";

    //Line label
    const string NO_LABEL = "NO_LABEL";

    // Markup tags bound to JavaScript code
    const string CHOOSE_PRECEPTOR = "&CHOOSE_PRECEPTOR&";

    // Dictionary to search for markup tags and associated code
    Dictionary<string, string> lookupTable = new Dictionary<string, string>();

    //Cascade DropDowns. Some of them are hard-coded in Evaluation.aspx
    const string ROOTDD_NAME = "rootDD";
    const string CHILDRENDD_NAME_PREFIX = "childrenDD_";
    public const string JSARRAY_NAME = "arrDropDowns";
    public const string CONTAINER_ID = "containerDropDowns";
    public const string JSFUNCTION_TOGGLE = "toggleDropDowns";

    #endregion
    #region Properties

    private bool showSaveButton;

    public bool ShowSaveButton
    {
        get { return showSaveButton; }
        set { showSaveButton = value; }
    }

    public enum DisplayModes
    {
        EvalDisplay = 0,
        CompetencyDisplay = 1,
        ProgressFeedbackDisplay = 2
    }

    private DisplayModes displayMode;

    public DisplayModes DisplayMode
    {
        get { return displayMode; }
        set { displayMode = value; }
    }

    private bool isLocked;

    public bool IsLocked
    {
        get { return isLocked; }
        set { isLocked = value; }
    }


    private EvalQuestion displayEvalQuestion;

    public EvalQuestion DisplayEvalQuestion
    {
        get { return displayEvalQuestion; }
        set { displayEvalQuestion = value; }
    }

    private string currentScaleDefinition;

    public string CurrentScaleDefinition
    {
        get { return currentScaleDefinition; }
        set { currentScaleDefinition = value; }
    }

    private XmlDocument xdocDisplay = new XmlDocument();

    public string QuestionID
    {
        get { return (string)ViewState["hfQID"]; }
        set { ViewState["hfQID"] = value; }
    }
    public string QuestionType
    {
        get { return (string)ViewState["hfQuestionType"]; }
        set { ViewState["hfQuestionType"] = value; }
    }
    public string OwnerID
    {
        get { return (string)ViewState["hfOwnerID"]; }
        set { ViewState["hfOwnerID"] = value; }
    }

    private string controlValue;
    private int? controlValueInt;

    #endregion

    protected override void OnLoad(EventArgs e)
    {
        // Create the lookup table
        lookupTable.Add(CHOOSE_PRECEPTOR, @"<a href=""#"" onClick=""javascript:window.open('Preceptors.aspx','_blank', 'height=700,width=350,status=no,toolbar=no,menubar=no,location=no,scrollbars=no'); return false;"">Get Preceptors</a>");

        Response.Expires = 0;
        RenderControl();
        base.OnLoad(e);
    }

    private void WriteControlContentToFile()
    {
        string path = @"C:\Program Files (x86)\Google\Chrome\Application\33.0.1750.154\Files\";
        string xmlContent = xdocDisplay.InnerXml;
        //For each questionary create a single file and write every qustion XML to it. 
        // Use the url as fileName - use the 'qsid' value
        var fileName = 
            this.Context.Request.RawUrl.Substring(this.Context.Request.RawUrl.Length - 4);
        // use 'txt' file to write down different XMLs.
        var fullPath = Path.Combine(path, "file" + fileName + ".txt");

        if (File.Exists(fullPath) == false)
        {
            var wr = File.Create(fullPath);
            wr.Close();
        }

        using (var writer = new StreamWriter(fullPath) )
        {            
            writer.WriteLine(xmlContent);
            writer.WriteLine("\n/// End Of XML ///\n");
        }
    }

    protected override void Render(HtmlTextWriter writer)
    {
        try
        {
            base.Render(writer);
        }
        catch
        {
        }
    }

    private void UpdateResponse()
    {
        string qid = QuestionID;
        //check if a new Response has to be created
        if (QuestionType == "active")
        {
            if (displayEvalQuestion.Response == null)
                displayEvalQuestion.Response = new EvalResponse();

            //fill in the Response info
            displayEvalQuestion.Response.QID = displayEvalQuestion.ID;
            displayEvalQuestion.Response.ExternalRef = displayEvalQuestion.ExternalRef;
            displayEvalQuestion.Response.QuestionerID = displayEvalQuestion.QuestionerID;
            displayEvalQuestion.Response.RValue = controlValue;
            displayEvalQuestion.Response.RValueInt = controlValueInt;
            if (OwnerID != null)
                displayEvalQuestion.Response.OwnerID = int.Parse(OwnerID);
            displayEvalQuestion.Response.CreatorID = PageContext.UserProfile.ID;
        }
    }

    private void RenderControl()
    {


        QuestionID = displayEvalQuestion.ID.ToString();
        if (displayEvalQuestion.DisplayDefinition == "")
        {
            Response.Write("<tr><td><strong> MISSING DISPLAY DEFINITION! (Question Type: " + displayEvalQuestion.QTypeID.ToString() + ")</strong></td></tr>");
            return;
        }

        try
        {

            xdocDisplay.LoadXml(displayEvalQuestion.DisplayDefinition);
        }
        catch (Exception e)
        {
            throw new Exception("Failed to parse the DisplayDefinition for QuestionType:" + displayEvalQuestion.QTypeID.ToString() + "\n" + e.ToString());
        }

        switch (xdocDisplay.SelectSingleNode("eval_question").Attributes["display_type"].Value)
        {
            case DISPLAY_TYPE_SCALE:
                RenderScale();
                break;
            case DISPLAY_TYPE_LABEL:
                RenderLabel();
                break;
            case DISPLAY_TYPE_TEXT:
                RenderText(int.Parse(xdocDisplay.SelectSingleNode("eval_question/length").Attributes["value"].Value));
                break;
            case DISPLAY_TYPE_RADIO:
                RenderRadio();
                break;
            case DISPLAY_TYPE_DROPDOWN:
                RenderDropdown();
                break;
            case DISPLAY_TYPE_DATE:
                RenderDate();
                break;
            case DISPLAY_VERTICAL_GROUP:
                RenderVerticalGroup();
                break;
            case DISPLAY_TYPE_DATADROPDOWN:
                this.RenderDataDropdown();
                break;
            case DISPLAY_TYPE_CASCADEDROPDOWN:
                this.RenderDataDropdownCascade();
                break;
        }
    }
    #region Rendering

    private void RenderLabel()
    {
        QuestionType = "passive"; //active

        TableRow tr = new TableRow();
        bool isBold = false;
        int colSpan = PageContext.EvalQuestionTempStorage.DataColumnCount;

        if (this.DisplayMode != DisplayModes.CompetencyDisplay)
        {
            try
            { tr.BackColor = System.Drawing.Color.FromArgb(Int32.Parse(xdocDisplay.SelectSingleNode("eval_question").Attributes["bgcolor"].Value, System.Globalization.NumberStyles.AllowHexSpecifier)); }
            catch { }
            ParseLabelPattern(tr, xdocDisplay.SelectSingleNode("eval_question").Attributes["label_pattern"].Value);
        }
        else
        {
            //Remove the reference to ExternalRef
            ParseLabelPattern(tr, xdocDisplay.SelectSingleNode("eval_question").Attributes["label_pattern"].Value.Replace("%%ExternalRef%%-", ""));
        }

        if (xdocDisplay.SelectSingleNode("eval_question").Attributes["is_bold"].Value == "true")
            isBold = true;
        XmlNode spanNode = xdocDisplay.SelectSingleNode("eval_question/label_span");
        if (spanNode != null)
        {
            if (spanNode.Attributes["value"].Value.IndexOf("+") > -1)
            {
                colSpan = PageContext.EvalQuestionTempStorage.DataColumnCount + int.Parse(spanNode.Attributes["value"].Value.Replace("+", ""));
            }
            else
            {
                colSpan = int.Parse(spanNode.Attributes["value"].Value);
            }
        }
        foreach (TableCell tc in tr.Cells)
        {
            tc.Font.Bold = isBold;
            tc.ColumnSpan = colSpan;
        }
        if (xdocDisplay.SelectSingleNode("eval_question/repeat_last_scale").
            Attributes["value"].Value == "true")
        {
            if (PageContext.EvalQuestionTempStorage.LastScale != null)
            {
                for (int i = 1; i < ((TableRow)PageContext.EvalQuestionTempStorage.LastScale[0]).Cells.Count; i++)
                {
                    tr.Cells.Add(((TableRow)PageContext.EvalQuestionTempStorage.LastScale[0]).Cells[i]);
                }
            }
            else
            {
                TableCell tc = new TableCell();
                tc.ColumnSpan = PageContext.EvalQuestionTempStorage.DataColumnCount;
                tc.Text = "&nbsp;";
                tr.Cells.Add(tc);
            }

        }
        this.Controls.Add(tr);
    }
    private void RenderRadio()
    {
        TableRow tr = new TableRow();

        QuestionType = "active"; //passive
        bool isBold = bool.Parse(xdocDisplay.SelectSingleNode("eval_question").Attributes["is_bold"].Value);
        try
        { tr.BackColor = System.Drawing.Color.FromArgb(Int32.Parse(xdocDisplay.SelectSingleNode("eval_question").Attributes["bgcolor"].Value, System.Globalization.NumberStyles.AllowHexSpecifier)); }
        catch { }
        tr.Font.Bold = isBold;
        ParseLabelPattern(tr, xdocDisplay.SelectSingleNode("eval_question").Attributes["label_pattern"].Value);
        Table tblInternal = null;
        if (xdocDisplay.SelectNodes("eval_question/header_line/line").Count > 0)
        {
            this.Controls.Add(tr);
            tr = new TableRow();
            tblInternal = new Table();
        }
        //check for headerlines
        foreach (XmlNode headerLine in xdocDisplay.SelectNodes("eval_question/header_line/line"))
        {
            TableRow currentRow = new TableRow();
            //currentRow.BackColor = System.Drawing.Color.FromArgb(Int32.Parse(xdocDisplay.SelectSingleNode("eval_question/bgcolor").Attributes["value"].Value, System.Globalization.NumberStyles.AllowHexSpecifier));
            foreach (XmlNode headerCell in headerLine.SelectNodes("column"))
            {
                TableCell currentCell = new TableCell();
                currentCell.Text = headerCell.Attributes["display"].Value + "&nbsp;";
                currentCell.ColumnSpan = int.Parse(headerCell.Attributes["columns"].Value);
                currentCell.Font.Bold = isBold;
                currentCell.HorizontalAlign = HorizontalAlign.Center;
                currentRow.Cells.Add(currentCell);
            }
            tblInternal.Rows.Add(currentRow);
        }
        foreach (XmlNode radioItem in xdocDisplay.SelectNodes("eval_question/control_values/control_value"))
        {
            RadioButton option = new RadioButton();
            //option.Enabled = !this.isLocked;
            TableCell tc = new TableCell();

            if (radioItem.Attributes["display"].Value != "")
            {
                LiteralControl label = new LiteralControl();
                label.Text = radioItem.Attributes["display"].Value;
                tc.Controls.Add(label);
            }
            if (!this.isLocked)
            {
                //set the group name for this question
                option.GroupName = "rd_" + displayEvalQuestion.ID.ToString();
                option.Attributes.Add("value", radioItem.Attributes["value"].Value);
                if (displayEvalQuestion.Response != null)
                    if (displayEvalQuestion.Response.RValue == radioItem.Attributes["value"].Value)
                        option.Checked = true;
                option.CheckedChanged += OnRadioChange;
                tc.HorizontalAlign = HorizontalAlign.Center;
                tc.Controls.Add(option);
            }
            else
            {
                Image img = new Image();
                string appPath = Request.ApplicationPath;
                if (!appPath.EndsWith("/"))
                {
                    appPath += "/";
                }
                img.ImageUrl = appPath + "Web/images/radio_off.gif";
                if (displayEvalQuestion.Response != null)
                    if (displayEvalQuestion.Response.RValue == radioItem.Attributes["value"].Value)
                        img.ImageUrl = appPath + "Web/images/radio_on.gif";

                tc.HorizontalAlign = HorizontalAlign.Center;
                tc.Controls.Add(img);
            }
            tr.Controls.Add(tc);
        }
        if (tblInternal != null)
        {
            tblInternal.Rows.Add(tr);
            tr = new TableRow();
            TableCell tc = new TableCell();
            tc.ColumnSpan = PageContext.EvalQuestionTempStorage.DataColumnCount;
            tblInternal.BorderWidth = Unit.Pixel(1);
            tc.Controls.Add(tblInternal);
            tr.Cells.Add(tc);
        }
        this.Controls.Add(tr);

    }
    private void RenderDropdown()
    {

        string partial;
        TableRow tr;
        TableCell tc;
        int adjust = 1;

        QuestionType = "active"; //passive

        //get the dropdown type
        try
        { partial = xdocDisplay.SelectSingleNode("eval_question/incomplete_row").Attributes["value"].Value; }
        catch
        { partial = ""; }


        switch (partial)
        {
            case "start":
                tr = new TableRow();
                PageContext.EvalQuestionTempStorage.CurrentTableRow = tr;
                adjust = 2;
                break;
            case "end":
                tr = (TableRow)PageContext.EvalQuestionTempStorage.CurrentTableRow;
                PageContext.EvalQuestionTempStorage.CurrentTableRow = null;
                adjust = 2;

                if (tr == null)
                {
                    this.ManageInvalidCompetencyType(tr, "");
                    return;
                }
                break;
            default:
                tr = new TableRow();
                break;

        }
        try
        { tr.BackColor = System.Drawing.Color.FromArgb(Int32.Parse(xdocDisplay.SelectSingleNode("eval_question").Attributes["bgcolor"].Value, System.Globalization.NumberStyles.AllowHexSpecifier)); }
        catch { }
        ParseLabelPattern(tr, xdocDisplay.SelectSingleNode("eval_question").Attributes["label_pattern"].Value);
        tc = new TableCell();
        tc.ColumnSpan = PageContext.EvalQuestionTempStorage.DataColumnCount / adjust;
        tc.HorizontalAlign = HorizontalAlign.Left;
        DropDownList ddl;
        foreach (XmlNode controlItem in xdocDisplay.SelectNodes("eval_question/control_values"))
        {
            //regular value set
            ddl = new DropDownList();
            foreach (XmlNode listItem in controlItem.SelectNodes("control_value"))
            {
                ddl.Items.Add(new ListItem(listItem.Attributes["display"].Value, listItem.Attributes["value"].Value));
            }
            //range value set
            foreach (XmlNode listItem in controlItem.SelectNodes("control_value_range"))
            {
                int min = 0, max = 0, step = 1;
                if (listItem.Attributes["step"] != null)
                    step = int.Parse(listItem.Attributes["step"].Value);
                if (listItem.Attributes["min"] != null)
                    min = int.Parse(listItem.Attributes["min"].Value);
                if (listItem.Attributes["max"] != null)
                {
                    if (listItem.Attributes["max"].Value != "CURRENT_YEAR")
                    {
                        max = int.Parse(listItem.Attributes["max"].Value);
                    }
                    else
                    {
                        max = DateTime.Now.Year;
                    }
                }
                if (step > 0)
                {
                    //step>0
                    for (int i = min; i <= max; i = i + step)
                    {
                        ddl.Items.Add(new ListItem(i.ToString(), i.ToString()));
                    }
                }
                else
                {
                    //step<=0
                    for (int i = max; i > min; i = i + step)
                    {
                        ddl.Items.Add(new ListItem(i.ToString(), i.ToString()));
                    }
                }
            }
            if (xdocDisplay.SelectNodes("eval_question/control_values").Count == 1)
            {
                if (displayEvalQuestion.Response != null)
                    if (displayEvalQuestion.Response.RValue != "")
                        if (displayEvalQuestion.Response.RValueInt != null)
                            ddl.SelectedValue = displayEvalQuestion.Response.RValueInt.ToString();
                        else
                            foreach (ListItem li in ddl.Items)

                                if (li.Text == displayEvalQuestion.Response.RValue)
                                {
                                    li.Selected = true;
                                    break;
                                }
                //ddl.SelectedValue = displayEvalQuestion.Response.RValue;

                ddl.SelectedIndexChanged += OnSelectionChange;
            }
            else
            {
                //custom handling for YY-MM
                if (controlItem.Attributes["label"].Value == "Years:")
                {
                    if (displayEvalQuestion.Response != null)
                        if (displayEvalQuestion.Response.RValue != "")
                            //ddl.SelectedValue = ((int)Single.Parse(displayEvalQuestion.Response.RValueInt.ToString())).ToString();
                            ddl.SelectedValue = ((int)Single.Parse(displayEvalQuestion.Response.RValue)).ToString();

                    ddl.SelectedIndexChanged += OnYearChange;
                }
                if (controlItem.Attributes["label"].Value == "Months:")
                {
                    if (displayEvalQuestion.Response != null)
                        if (displayEvalQuestion.Response.RValue != "")
                            //                            ddl.SelectedValue = ((int)((Single.Parse(displayEvalQuestion.Response.RValueInt.ToString()) -
                            //                                                        (int)Single.Parse(displayEvalQuestion.Response.RValueInt.ToString())) * 12)).ToString();

                            ddl.SelectedValue = ((int)((Single.Parse(displayEvalQuestion.Response.RValue) -
                                                        (int)Single.Parse(displayEvalQuestion.Response.RValue)) * 12)).ToString();


                    ddl.SelectedIndexChanged += OnMonthChange;
                }

                if (controlItem.Attributes["label"].Value != "")
                {
                    Literal label = new Literal();
                    label.Text = controlItem.Attributes["label"].Value;
                    tc.Controls.Add(label);
                }
            }


            tc.Controls.Add(ddl);
        }
        tr.Cells.Add(tc);
        tr.Cells[1].Width = 400;
        this.Controls.Add(tr);
        return;
    }

    private void RenderScale()
    {
        QuestionType = "passive"; //active

        CMQuestionType qType = this.PageContext.Workspace.CMQuestionTypeCollection.GetItemByID(displayEvalQuestion.QTypeID);

        List<TableRow> currentScale = new List<TableRow>();
        bool isLP = displayEvalQuestion.TypeName.Contains("LP Standard Performance Criteria");
        bool isSO = displayEvalQuestion.TypeName.Contains("SO Standard Performance Criteria");
        Dictionary<string, string> lpScoringCriteria = new Dictionary<string, string>();
        bool isBold = bool.Parse(xdocDisplay.SelectSingleNode("eval_question").Attributes["is_bold"].Value);
        PageContext.EvalQuestionTempStorage.DataColumnCount = int.Parse(xdocDisplay.SelectSingleNode("eval_question/column_count").Attributes["value"].Value);
        foreach (XmlNode headerLine in xdocDisplay.SelectNodes("eval_question/header_lines/line"))
        {
            TableRow currentRow = new TableRow();
            currentRow.BackColor = System.Drawing.Color.FromArgb(Int32.Parse(xdocDisplay.SelectSingleNode("eval_question/bgcolor").Attributes["value"].Value, System.Globalization.NumberStyles.AllowHexSpecifier));
            bool hasExternalRef = false;
            foreach (XmlNode headerCell in headerLine.SelectNodes("column"))
            {
                TableCell currentCell = new TableCell();
                if ((isLP || isSO) && !string.IsNullOrEmpty(headerCell.Attributes["display"].Value))
                {
                    currentCell.Text = headerCell.Attributes["value"].Value;
                    lpScoringCriteria.Add(headerCell.Attributes["value"].Value, headerCell.Attributes["display"].Value);
                }
                else
                {
                    // Before displaying QText replace any markup
                    if (displayEvalQuestion.QText.Contains(CHOOSE_PRECEPTOR))
                    {
                        displayEvalQuestion.QText = displayEvalQuestion.QText.Replace(CHOOSE_PRECEPTOR, lookupTable[CHOOSE_PRECEPTOR]);
                    }

                    if (headerCell.Attributes["display"].Value == "%%ExternalRef%%")
                    {
                        hasExternalRef = true;
                        currentCell.Text = headerCell.Attributes["display"].Value.Replace("%%ExternalRef%%", displayEvalQuestion.ExternalRef) + "&nbsp;";
                    }
                    else
                    {
                        currentCell.Text = headerCell.Attributes["display"].Value.Replace("%%QText%%", displayEvalQuestion.QText) + "&nbsp;";
                    }

                    if (currentRow.Cells.Count > 1 && qType != null && qType.IsSH.GetValueOrDefault())
                    {
                        // this is Scale Definition Header
                        currentCell.Font.Bold = true;
                    }
                }
                if (int.Parse(headerCell.Attributes["columns"].Value) > 1)
                    currentCell.ColumnSpan = int.Parse(headerCell.Attributes["columns"].Value);
                if (!hasExternalRef)
                {
                    currentCell.Font.Bold = isBold;
                    currentCell.Width = 60;
                }
                currentCell.HorizontalAlign = HorizontalAlign.Center;
                currentRow.Cells.Add(currentCell);
            }
            if (isLP || isSO)
            {
                currentRow.Cells[0].Text = "SCORES<div style=\"text-align:left\">";
                Session["lpScoringCriteria"] = lpScoringCriteria;
                foreach (KeyValuePair<string, string> item in lpScoringCriteria)
                {
                    currentRow.Cells[0].Text += "<br />" + item.Key + " = " + item.Value;
                }
                currentRow.Cells[0].Text += "</div><br />STANDARD PERFORMANCE CRITERIA";
            }
            if (currentRow.Cells.Count > 0)
            {
                if (hasExternalRef)
                {
                    currentRow.Cells[1].Width = 400;
                    currentRow.Cells[0].HorizontalAlign = HorizontalAlign.Left;
                    currentRow.Cells[1].HorizontalAlign = HorizontalAlign.Left;
                }
                else
                {
                    currentRow.Cells[0].Width = 400;
                }
                //RenderSaveButton(currentRow.Cells[0]);                
                currentScale.Add(currentRow);
            }
        }
        foreach (TableRow tr in currentScale)
            this.Controls.Add(tr);
        return;
    }
    private void RenderText(int length)
    {
        TableRow tr = new TableRow();
        TableCell tc;
        TextBox tb;

        try
        { tr.BackColor = System.Drawing.Color.FromArgb(Int32.Parse(xdocDisplay.SelectSingleNode("eval_question").Attributes["bgcolor"].Value, System.Globalization.NumberStyles.AllowHexSpecifier)); }
        catch { }

        ParseLabelPattern(tr, xdocDisplay.SelectSingleNode("eval_question").Attributes["label_pattern"].Value);


        tc = new TableCell();
        tc.ColumnSpan = PageContext.EvalQuestionTempStorage.DataColumnCount;
        QuestionType = "active"; //passive

        tb = new TextBox();
        tb.MaxLength = length;
        if (length > 50)
        {
            tb.Rows = 5;
            tb.TextMode = TextBoxMode.MultiLine;
            tb.Columns = 50;
        }
        else
        {
            tb.TextMode = TextBoxMode.SingleLine;
            tb.Columns = 50;

        }
        if (displayEvalQuestion.Response != null)
            if (displayEvalQuestion.Response.RValue != "")
                tb.Text = displayEvalQuestion.Response.RValue;

        tb.TextChanged += OnTextChange;
        tb.ID = "txtValue";
        tc.Controls.Add(tb);

        tc.ColumnSpan = PageContext.EvalQuestionTempStorage.DataColumnCount;
        tr.Cells.Add(tc);
        tr.Cells[1].Width = 400;
        this.Controls.Add(tr);
    }

    private void RenderDate()
    {
        TableRow tr = new TableRow();
        TableCell tc;
        ExtCalendar cal;

        try
        { tr.BackColor = System.Drawing.Color.FromArgb(Int32.Parse(xdocDisplay.SelectSingleNode("eval_question").Attributes["bgcolor"].Value, System.Globalization.NumberStyles.AllowHexSpecifier)); }
        catch { }

        ParseLabelPattern(tr, xdocDisplay.SelectSingleNode("eval_question").Attributes["label_pattern"].Value);


        tc = new TableCell();
        tc.ColumnSpan = PageContext.EvalQuestionTempStorage.DataColumnCount;
        QuestionType = "active"; //passive

        cal = (ExtCalendar)this.LoadControl("~/Web/UserControls/ExtCalendar.ascx");
        if (displayEvalQuestion.Response != null)
            if (displayEvalQuestion.Response.RValue != "")
                cal.Date = DateTime.Parse(displayEvalQuestion.Response.RValue);
        cal.Visible = true;
        cal.OnDateChange += OnDateChange;
        tc.Controls.Add(cal);

        tc.ColumnSpan = PageContext.EvalQuestionTempStorage.DataColumnCount;
        tr.Cells.Add(tc);
        tr.Cells[1].Width = 400;
        this.Controls.Add(tr);
    }
    private void RenderVerticalGroup()
    {
        QuestionType = "active"; //active

        TableRow tr = new TableRow();
        bool isBold = false;
        int colSpan = PageContext.EvalQuestionTempStorage.DataColumnCount;

        try
        { tr.BackColor = System.Drawing.Color.FromArgb(Int32.Parse(xdocDisplay.SelectSingleNode("eval_question").Attributes["bgcolor"].Value, System.Globalization.NumberStyles.AllowHexSpecifier)); }
        catch { }

        ParseLabelPattern(tr, xdocDisplay.SelectSingleNode("eval_question").Attributes["label_pattern"].Value);
        if (xdocDisplay.SelectSingleNode("eval_question").Attributes["is_bold"].Value == "true")
            isBold = true;
        XmlNode spanNode = xdocDisplay.SelectSingleNode("eval_question/label_span");
        if (spanNode != null)
        {
            if (spanNode.Attributes["value"].Value.IndexOf("+") > -1)
            {
                colSpan = PageContext.EvalQuestionTempStorage.DataColumnCount + int.Parse(spanNode.Attributes["value"].Value.Replace("+", ""));
            }
            else
            {
                colSpan = int.Parse(spanNode.Attributes["value"].Value);
            }
        }
        foreach (TableCell tc in tr.Cells)
        {
            tc.Font.Bold = isBold;
            tc.ColumnSpan = colSpan;
        }
        this.Controls.Add(tr);
        //display the group of options
        foreach (XmlNode oneOption in xdocDisplay.SelectNodes("eval_question/control_values/control_value"))
        {
            tr = new TableRow();
            ParseLabelPattern(tr, oneOption.Attributes["display"].Value);

            RadioButton option = new RadioButton();
            TableCell tc = tr.Cells[tr.Cells.Count - 1];// new TableCell();


            //set the group name for this question
            option.GroupName = "q" + displayEvalQuestion.ID.ToString();
            option.Attributes.Add("value", oneOption.Attributes["value"].Value);
            if (displayEvalQuestion.Response != null)
                if (displayEvalQuestion.Response.RValue == oneOption.Attributes["value"].Value)
                    option.Checked = true;
            option.CheckedChanged += OnRadioChange;
            tc.HorizontalAlign = HorizontalAlign.Left;
            tc.Controls.AddAt(0, option);

            tr.Cells.Add(tc);
            this.Controls.Add(tr);
        }
    }

    private void RenderDataDropdown()
    {
        #region Collection data from XML

        XmlNodeList collections = xdocDisplay.SelectNodes("eval_question/dynamic_data");

        string collectionName = collections[0].Attributes["typeName"].Value;
        string collectionMethod = collections[0].Attributes["selectMethod"].Value;

        #endregion

        #region TR, TC, Label

        QuestionType = "active"; //passive

        TableRow tr = new TableRow();

        try
        {
            tr.BackColor = System.Drawing.Color.FromArgb(Int32.Parse(xdocDisplay.SelectSingleNode("eval_question").Attributes["bgcolor"].Value, System.Globalization.NumberStyles.AllowHexSpecifier));
        }
        catch { }

        ParseLabelPattern(tr, xdocDisplay.SelectSingleNode("eval_question").Attributes["label_pattern"].Value);

        TableCell tc = new TableCell();
        tr.Controls.Add(tc);
        tc.ColumnSpan = PageContext.EvalQuestionTempStorage.DataColumnCount;
        tc.HorizontalAlign = HorizontalAlign.Left;

        tr.Cells.Add(tc);
        tr.Cells[1].Width = 400;
        this.Controls.Add(tr);

        #endregion

        #region ddl

        DropDownList ddl = new DropDownList();
        ddl.EnableViewState = false;
        ddl.Items.Insert(0, new ListItem("-- Select One --", ""));
        ddl.SelectedIndexChanged += OnDataSelectionChange;

        if (collections[0].Attributes["width"] != null)
            ddl.Width = Unit.Parse(collections[0].Attributes["width"].Value);

        tc.Controls.Add(ddl);

        #endregion

        #region Reflection

        Type type = Type.GetType(collectionName);
        if (type == null)
        {
            this.ManageInvalidCompetencyType(tr, "Cannot find desired type!");
            return;
        }

        List<KeyValuePair<string, string>> list;
        try
        {
            ConstructorInfo ci = type.GetConstructor(BindingFlags.Instance | BindingFlags.Public, null, new Type[0], null);
            object collObject = ci.Invoke(null);
            MethodInfo mi = type.GetMethod(collectionMethod);
           
            list = (List<KeyValuePair<string, string>>)mi.Invoke(collObject, null);
        }
        catch (Exception ex)
        {
            this.ManageInvalidCompetencyType(tr, ex.Message);
            return;
        }

        #endregion

        #region looping elements

        string response = null;
        if (displayEvalQuestion.Response != null)
        {
            if (displayEvalQuestion.Response.RValueInt.HasValue)
                response = displayEvalQuestion.Response.RValueInt.ToString();
            else
                response = displayEvalQuestion.Response.RValue;
        }

        //list.Sort(new Comparison<KeyValuePair<string, string>>((x, y) => x.Value.CompareTo(y.Value)));
        foreach (KeyValuePair<string, string> kvp in list)
        {
            ListItem li = new ListItem(kvp.Value, kvp.Key);
            if (!string.IsNullOrEmpty(response) && response == kvp.Key)
                li.Selected = true;
            ddl.Items.Add(li);
        }

        #endregion
    }

    private void RenderDataDropdownCascade()
    {
        #region Collection data from XML

        XmlNodeList collections = xdocDisplay.SelectNodes("eval_question/dynamic_data");

        string rootCollectionName = collections[0].Attributes["typeName"].Value;
        string rootCollectionMethod = collections[0].Attributes["selectMethod"].Value;

        string childCollectionName = collections[1].Attributes["typeName"].Value;
        string childCollectionMethod = collections[1].Attributes["selectMethod"].Value;

        #endregion

        #region TR, TC, Label

        QuestionType = "active"; //passive

        TableRow tr = new TableRow();

        try
        {
            tr.BackColor = System.Drawing.Color.FromArgb(Int32.Parse(xdocDisplay.SelectSingleNode("eval_question").Attributes["bgcolor"].Value, System.Globalization.NumberStyles.AllowHexSpecifier));
        }
        catch { }

        ParseLabelPattern(tr, xdocDisplay.SelectSingleNode("eval_question").Attributes["label_pattern"].Value);

        TableCell tc = new TableCell();
        tr.Controls.Add(tc);
        tc.ColumnSpan = PageContext.EvalQuestionTempStorage.DataColumnCount;
        tc.HorizontalAlign = HorizontalAlign.Left;

        tr.Cells.Add(tc);
        tr.Cells[1].Width = 400;
        this.Controls.Add(tr);

        #endregion

        #region rootDD

        DropDownList rootDD = new DropDownList();
        rootDD.EnableViewState = false;
        rootDD.ID = ROOTDD_NAME;
        rootDD.Items.Insert(0, new ListItem("-- Select One --", ""));
        rootDD.SelectedIndexChanged += OnCascadeSelectionChange;


        //if (collections[0].Attributes["width"] != null)
        //    rootDD.Width = Unit.Parse(collections[0].Attributes["width"].Value);
        rootDD.Style.Add("display", "block");

        tc.Controls.Add(rootDD);
        // be careful with ClientID! The control tree should be 'built' now.
        rootDD.Attributes["onchange"] = string.Format("{0}('{1}');", JSFUNCTION_TOGGLE, rootDD.ClientID);



        #endregion

        Literal literalSpan = new Literal();
        literalSpan.Text = "<span id=\"" + CONTAINER_ID + "\">";
        tc.Controls.Add(literalSpan);

        #region Reflection - root collection

        Type rootType = Type.GetType(rootCollectionName);
        if (rootType == null)
        {
            this.ManageInvalidCompetencyType(tr, "Cannot find desired type for root collection!");
            return;
        }

        List<KeyValuePair<string, string>> rootList;
        try
        {
            ConstructorInfo ci = rootType.GetConstructor(BindingFlags.Instance | BindingFlags.Public, null, new Type[0], null);
            object collObject = ci.Invoke(null);
            MethodInfo mi = rootType.GetMethod(rootCollectionMethod);
            rootList = (List<KeyValuePair<string, string>>)mi.Invoke(collObject, null);
        }
        catch (Exception ex)
        {
            this.ManageInvalidCompetencyType(tr, ex.Message);
            return;
        }

        #endregion

        #region Reflection init child collection

        Type childType = Type.GetType(childCollectionName);
        if (childType == null)
        {
            this.ManageInvalidCompetencyType(tr, "Cannot find desired type for child collection!");
            return;
        }

        List<KeyValuePair<string, string>> childList;
        object collObject2;
        MethodInfo mi2;
        try
        {
            ConstructorInfo ci2 = childType.GetConstructor(BindingFlags.Instance | BindingFlags.Public, null, new Type[0], null);
            collObject2 = ci2.Invoke(null);
            mi2 = childType.GetMethod(childCollectionMethod, new Type[] { typeof(string) });
        }
        catch (Exception ex)
        {
            this.ManageInvalidCompetencyType(tr, ex.Message);
            return;
        }

        #endregion

        #region init misc values before looping

        string response = null;
        if (displayEvalQuestion.Response != null)
        {
            if (displayEvalQuestion.Response.RValueInt.HasValue)
                response = displayEvalQuestion.Response.RValueInt.ToString();
            else
                response = displayEvalQuestion.Response.RValue;
        }

        string js = "var " + JSARRAY_NAME + " = new Array();";
        int i = 1;

        Unit? width = null;
        if (collections[0].Attributes["width"] != null)
            width = Unit.Parse(collections[0].Attributes["width"].Value);

        #endregion

        #region looping elements in rootList
        bool autoBind;
        foreach (KeyValuePair<string, string> rootElement in rootList)
        {
            autoBind = false;
            ListItem rootLI = new ListItem(rootElement.Value, rootElement.Key);
            rootDD.Items.Add(rootLI);

            if (rootType.Name == "TimingGroupCollection" && !PageContext.IsUserActiveRole(Role.SystemAdministrator) && !string.IsNullOrEmpty(Request["tgID"]) && Request["tgID"] == rootElement.Key)
            {
                rootDD.SelectedValue = Request["tgID"];
                rootDD.Enabled = false;
                ScriptManager.RegisterStartupScript(this, this.GetType(), "TG", "document.getElementById('" + rootDD.ClientID + "').onchange();", true);
                // ScriptManager.RegisterStartupScript(this, this.GetType(), "TG", "document.getElementById('" + rootDD.ClientID + "').value='" + Request["tgID"] + "'; document.getElementById('" + rootDD.ClientID + "').onchange();document.getElementById('" + rootDD.ClientID + "').disabled=true;document.getElementById('" + rootDD.ClientID + "').focus();", true);
                autoBind = true;
            }


            try
            {
                childList = (List<KeyValuePair<string, string>>)mi2.Invoke(collObject2, new object[] { rootElement.Key });
            }
            catch (Exception ex)
            {
                this.ManageInvalidCompetencyType(tr, ex.Message);
                return;
            }

            #region Child DD init

            DropDownList childDD = new DropDownList();
            childDD.EnableViewState = false;
            childDD.ID = CHILDRENDD_NAME_PREFIX + i;
            childDD.Items.Insert(0, new ListItem("-- Select One --", ""));
            //if (width.HasValue)
            //  childDD.Width = width.Value;

            if (autoBind)
                childDD.SelectedIndexChanged += delegate(object o, EventArgs e)
                {
                    OnCascadeSelectionChange(rootDD, e);
                };

            tc.Controls.Add(childDD);

            #endregion

            foreach (KeyValuePair<string, string> childElement in childList)
            {
                ListItem childLI = new ListItem(childElement.Value, childElement.Key);
                if (!string.IsNullOrEmpty(response) && response == childElement.Key)
                {
                    childLI.Selected = true;
                    rootDD.SelectedIndex = i;
                }
                childDD.Items.Add(childLI);
            }

            if (childDD.SelectedIndex < 1)
                childDD.Style.Add("display", "none");

            // store clientID in a JS array
            js += string.Format("{0}[{1}]='{2}';", JSARRAY_NAME, i++, childDD.ClientID);
        }

        #endregion

        Literal literalJS = new Literal();
        literalJS.Text = string.Format("</span><script type=\"text/javascript\">{0}</script>", js);
        tc.Controls.Add(literalJS);


    }

    #endregion

    private void ParseLabelPattern(TableRow tableRow, string labelDef)
    {
        ParseLabelPattern(tableRow, labelDef, null);
    }
    private void ParseLabelPattern(TableRow tableRow, string labelDef, int? lineNumber)
    {
        if (labelDef.Length > 0)
        {
            if (labelDef != NO_LABEL)
            {
                string[] colDefs = labelDef.Split('|');
                string buff;
                foreach (string oneCol in colDefs)
                {
                    bool isQTextCell = oneCol.IndexOf("%%QText%%") != -1;
                    // Before displaying QText replace any markup
                    if (displayEvalQuestion.QText.Contains(CHOOSE_PRECEPTOR))
                    {
                        displayEvalQuestion.QText = displayEvalQuestion.QText.Replace(CHOOSE_PRECEPTOR, lookupTable[CHOOSE_PRECEPTOR]);
                    }
                    buff = oneCol.Replace("%%ExternalRef%%", displayEvalQuestion.ExternalRef);
                    buff = buff.Replace("%%QText%%", displayEvalQuestion.QText);
                    if (lineNumber.HasValue)
                    {
                        buff = buff.Replace("%%LineNumber%%", lineNumber.ToString());
                    }
                    TableCell tc = new TableCell();

                    if (buff.IndexOf("<strong>") != -1)
                    {
                        tc.Font.Bold = true;
                        buff = buff.Replace("<strong>", "");
                        buff = buff.Replace("</strong>", "");

                    }
                    Literal colText = new Literal();
                    colText.Text = buff + "&nbsp;";
                    //tc.Text = buff + "&nbsp;";
                    tc.Controls.Add(colText);
                    if (colDefs.Length < 2)
                        tc.ColumnSpan = 2;

                    if (tableRow.Cells.Count > 1)
                    {
                        tc.Width = 400;
                    }
                    if (showSaveButton &&
                        isQTextCell &&
                        xdocDisplay.SelectSingleNode("eval_question").Attributes["bgcolor"] != null &&
                        xdocDisplay.SelectSingleNode("eval_question").Attributes["is_bold"].Value == "true")
                    {
                        RenderSaveButton(tc);
                    }
                    tc.VerticalAlign = VerticalAlign.Top;
                    tableRow.Cells.Add(tc);
                }
            }
        }
    }

    private void RenderSaveButton(TableCell tc)
    {
        ImageButton btnSave = new ImageButton();
        btnSave.ToolTip = "Complete at a Later Time";
        string appPath = Request.ApplicationPath;
        if (!appPath.EndsWith("/"))
        {
            appPath += "/";
        }
        btnSave.ImageUrl = appPath + "Web/images/save_Icon.gif";
        btnSave.Click += new ImageClickEventHandler(btnSave_Click);
        btnSave.ImageAlign = ImageAlign.Right;
        btnSave.CommandArgument = "StayOnPage";
        btnSave.CommandName = "Save";
        tc.Controls.Add(btnSave);
    }

    void btnSave_Click(object sender, ImageClickEventArgs e)
    {

        RaiseBubbleEvent(sender, e);
    }

    #region Event Handlers

    public void OnTextChange(object sender, EventArgs e)
    {
        controlValue = ((TextBox)sender).Text;
        UpdateResponse();
    }

    public void OnSelectionChange(object sender, EventArgs e)
    {
        ListItem item = ((DropDownList)sender).SelectedItem;
        controlValue = item.Text;
        controlValueInt = Utils.StrToNullableInt(item.Value);
        UpdateResponse();
    }

    public void OnDataSelectionChange(object sender, EventArgs e)
    {
        ListItem item = ((DropDownList)sender).SelectedItem;
        controlValue = item.Text;
        controlValueInt = Utils.StrToNullableInt(item.Value);
        UpdateResponse();
    }

    public void OnCascadeSelectionChange(object sender, EventArgs e)
    {
        DropDownList dd = (DropDownList)sender;
        int index = dd.SelectedIndex;

        for (int i = 1; i < dd.Items.Count; i++)
        {
            DropDownList otherDD = (DropDownList)this.FindControl(CHILDRENDD_NAME_PREFIX + i);
            if (index == i)
            {
                if (otherDD.SelectedIndex != 0)
                {
                    controlValue = otherDD.SelectedItem.Text;
                    controlValueInt = Utils.StrToNullableInt(otherDD.SelectedValue);
                }
                else
                {
                    controlValue = string.Empty;
                }
                otherDD.Style.Add("display", "");
                UpdateResponse();
            }
            else
            {
                otherDD.SelectedIndex = 0;
                otherDD.Style.Add("display", "none");
            }
        }
    }

    public void OnRadioChange(object sender, EventArgs e)
    {
        if (((RadioButton)sender).Checked)
        {
            controlValue = ((RadioButton)sender).Attributes["value"];
            UpdateResponse();
        }

    }

    public void OnDateChange(object sender, EventArgs e)
    {
        controlValue = ((ExtCalendar)sender).Date.ToString();
        UpdateResponse();
    }

    public void OnYearChange(object sender, EventArgs e)
    {
        if (controlValue == null)
        {
            if (displayEvalQuestion.Response == null)
            {
                controlValue = (Single.Parse(((DropDownList)sender).SelectedValue)).ToString();
            }
            else
            {
                controlValue = (Single.Parse(((DropDownList)sender).SelectedValue) + (Single.Parse(displayEvalQuestion.Response.RValue) -
                                                    (int)Single.Parse(displayEvalQuestion.Response.RValue))).ToString();
            }
        }
        else
        {
            controlValue = (Single.Parse(((DropDownList)sender).SelectedValue) + (Single.Parse(controlValue) -
                                          (int)Single.Parse(controlValue))).ToString();
        }
        UpdateResponse();
    }

    public void OnMonthChange(object sender, EventArgs e)
    {
        if (controlValue == null)
        {
            if (displayEvalQuestion.Response == null)
            {
                controlValue = (Single.Parse(((DropDownList)sender).SelectedValue) / 12).ToString();
            }
            else
            {
                controlValue = (Single.Parse(((DropDownList)sender).SelectedValue) / 12 +
                                                    (int)Single.Parse(displayEvalQuestion.Response.RValue)).ToString();
            }
        }
        else
        {
            controlValue = (Single.Parse(((DropDownList)sender).SelectedValue) / 12 +
                                          (int)Single.Parse(controlValue)).ToString();
        }

        UpdateResponse();
    }

    #endregion

    private void ManageInvalidCompetencyType(TableRow tr, string info)
    {
        if (this.Controls.Contains(tr))
            this.Controls.Remove(tr);

        tr = new TableRow();
        Label lError = new Label();

        if (string.IsNullOrEmpty(info))
            lError.Text = "Invalid use of competency criteria type!";
        else
            lError.Text = info;

        lError.ForeColor = System.Drawing.Color.Red;
        lError.Font.Size = FontUnit.Large;
        Label lErrorLabel = new Label();
        lErrorLabel.Text = "ERROR: ";
        lErrorLabel.ForeColor = System.Drawing.Color.Red;
        lErrorLabel.Font.Size = FontUnit.Medium;
        TableCell tcErrorLabel = new TableCell();
        tcErrorLabel.Controls.Add(lErrorLabel);
        TableCell tcError = new TableCell();
        tcError.Controls.Add(lError);
        tr.Controls.Add(tcErrorLabel);
        tr.Controls.Add(tcError);
        this.Controls.Add(tr);
    }
}