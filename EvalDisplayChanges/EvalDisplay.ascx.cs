using System;
using System.Data;
using System.Configuration;
using System.Collections;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using SystemArts.VersantRN.BusinessLogicLayer;
using SystemArts.VersantRN;
using System.Collections.Generic;
using System.IO;


public partial class EvalDisplay : SystemArts.VersantRN.WebUI.UserControlBase
{
    #region Properties
    private EvalQuestionCollection evalQuestions;

    public EvalQuestionCollection EvalQuestions
    {
        get { return evalQuestions; }
        set { evalQuestions = value; }
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

    private bool showSaveButton = false;

    public bool ShowSaveButton
    {
        get { return showSaveButton; }
        set { showSaveButton = value; }
    }
   
    #endregion


    protected void Page_Load(object sender, EventArgs e)
    {
        DisplayQuestions();
    }

    protected override void Render(HtmlTextWriter writer)
    {
        base.Render(writer);
        this.PageContext.EvalQuestionTempStorage = null;
    }

    private void DisplayQuestions()
    {
        PageContext.EvalQuestionTempStorage = new EvalQuestionTempStorage();

        if (evalQuestions == null) return;
        var allEvalQuestions = evalQuestions.AllItemsList();
        string path = 
            Path.Combine( @"..\Files\",
            "file" +  allEvalQuestions[0].QuestionerID +".txt");

        var exists = File.Exists(path);

        if (exists == false)
        {
            var stream = File.Create(path);
            stream.Close();
        }
       

        foreach (EvalQuestion eq in allEvalQuestions)
        {
            WriteToFile(path, eq, exists);
            
            EvalQuestionDisplay DisplayQuestion = new EvalQuestionDisplay();
            DisplayQuestion.DisplayEvalQuestion = eq;
            DisplayQuestion.ShowSaveButton = showSaveButton;
            DisplayQuestion.OwnerID = evalQuestions.OwnerID.ToString();
            DisplayQuestion.DisplayMode = (EvalQuestionDisplay.DisplayModes)this.DisplayMode;
            DisplayQuestion.IsLocked = this.isLocked;
            
            this.Controls.Add(DisplayQuestion);
        }
    }

    private void WriteToFile(string path, EvalQuestion question, bool exists)
    {
        var responseQuestion = new ResponseQuestion();
        
        responseQuestion.ID = question.ID;
        responseQuestion.Data = question;

        var toJson = new JavaScriptSerializer().Serialize(responseQuestion);

        if (!exists)
        {
            using (var writer = new StreamWriter(path,true))
            {
                writer.WriteLine(toJson);
                writer.WriteLine("/// End Of XML ///");
            }          
        }
    }
}

public class ResponseQuestion
{
    public int ID { get; set; }

    public EvalQuestion Data { get; set; }

}
