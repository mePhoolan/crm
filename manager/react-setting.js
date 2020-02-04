import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import { toast } from "react-toastify";
import DropdownCompV2 from "../common/dropdown_v2";
import {
  required,
  emailValiadte,
  mobileValidate
} from "../common/fieldValidations";
import RenderFiled from "../common/renderField";
import Loader from "../common/loader";
import PageHeader from "../common/pageheader";
import HTTP from "../../services/http";
import { ADMIN_TRACK_AUDIT_LOGS } from "../common/actions";
import infoOf from "../common/tooltip-text";
import TimePickers from "../common/timePicker";
import { response } from "express";

class Settings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      disableCronTime:true,
      cronTime:""
    };
    /**event binding  */
    this.addEditSettings = this.addEditSettings.bind(this);
    this.getSettings = this.getSettings.bind(this);
    this.getFile = this.getFile.bind(this);
  }

  componentWillMount() {
    this.getSettings();
    this.getCronTime();
  }
  
  getCronTime(){
     HTTP.Request("get", window.admin.checkCronLastTime).then(response => {
       // TODO: I assuming that you are sending cron time in response.cron_time
       // IMPORTANT to take care: Your response.cron_time should be in this format // 3:08 PM
       let api_cron_time= response.cron_time
       if(response.show_time){
          this.setState({ disableCronTime:false,cronTime:api_cron_time })  
        }else{
          this.setState({ disableCronTime:true,cronTime: api_cron_time })  
        }
     })
  }
  
  render() {
    const { handleSubmit } = this.props;
    const { isLoading } = this.state;
    return (
      <div>
        {isLoading && <Loader />}
        <div className="tab-pane active">
          <PageHeader pageTitle="Settings" route="Settings" />
          <form onSubmit={handleSubmit(this.addEditSettings)}>
            <Field
              name="sitename"
              icon="fa fa-info-circle"
              tooltip={infoOf.sitename}
              fieldName="Website Title*"
              type="text"
              placeholder="Site"
              component={RenderFiled}
              validate={[required]}
            />
            <Field
              name="sitesummary"
              icon="fa fa-info-circle"
              tooltip={infoOf.sitesummary}
              textarea
              fieldName="Site Summary"
              placeholder="Summary about your site"
              component={RenderFiled}
            />
            <Field
              name="map"
              icon="fa fa-info-circle"
              tooltip={infoOf.sitemap}
              textarea
              fieldName="Map"
              placeholder="Map"
              component={RenderFiled}
            />
            <label>Logo</label>
            <input
              type="file"
              onChange={this.getFile}
              accept="image/*"
              className="form-control"
            />
            <br />
            {this.state.image ? (
              <img
                src={this.state.image.secure_url}
                width="120px"
                className="img-responsive img-thumbnail i-bot"
                alt="logo"
              />
            ) : null}

            <Field
              name="email"
              icon="fa fa-info-circle"
              tooltip={infoOf.siteemail}
              fieldName="Contact Email*"
              type="email"
              placeholder="Email"
              component={RenderFiled}
              validate={[required, emailValiadte]}
            />
            <Field
              name="google_script"
              rows={8}
              textarea
              icon="fa fa-info-circle"
              tooltip={infoOf.siteemail}
              fieldName="Google/Bing Script*"
              type="text"
              placeholder="Google/Bing Script"
              component={RenderFiled}
              validate={[required]}
            />
            <Field
              name="mobile"
              fieldName="Mobile No."
              type="number"
              placeholder="Mobile No."
              component={RenderFiled}
              validate={[mobileValidate]}
            />
            <Field
              name="sms_service"
              placeholder="-select-"
              options={[
                {
                  label: "Active",
                  value: "true"
                },
                {
                  label: "In-Active",
                  value: "false"
                }
              ]}
              onChangeHoa={this.onChangeHoa}
              label="Choose Renovated SMS Service*"
              validate={required}
              textField="label"
              valueField="value"
              component={DropdownCompV2}
            />
            <Field
              name="wholesale_sms_service"
              placeholder="-select-"
              options={[
                {
                  label: "Active",
                  value: "true"
                },
                {
                  label: "In-Active",
                  value: "false"
                }
              ]}
              onChangeHoa={this.onChangeHoa}
              label="Choose Wholesale SMS Service*"
              validate={required}
              textField="label"
              valueField="value"
              component={DropdownCompV2}
            />
            <Field
              name="address"
              textarea
              fieldName="Address"
              type="text"
              placeholder="Address"
              component={RenderFiled}
            />

            <Field
              name="playstorelink"
              fieldName="Playstore Link"
              type="text"
              placeholder="Playstore Link"
              component={RenderFiled}
            />
            <Field
              name="applelink"
              fieldName="Apple iTune Link"
              type="text"
              placeholder="Apple iTune Link"
              component={RenderFiled}
            />
            <Field
              name="copyrights"
              fieldName="Copyrights Information"
              type="text"
              placeholder="copyrights"
              component={RenderFiled}
            />

            <Field
              id="cronjob_time"
              name="cronjob_time"
              fieldName="Cronjob Time*"
              input={{
                    value:this.state.cronTime
                    }}
              disabled={this.state.disableCronTime}
              component={TimePickers}
            />

            <div className="form-actions">
              <button
                type="submit"
                className="btn green uppercase"
                disabled={this.props.invalid || this.props.submitting}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  setCronTime(time) {
    HTTP.Request("get", window.admin.checkCronLastTime).then(response => {
      if (response.show_time) {
        // TODO: DO a post request to update your cron time
        HTTP.Request("post", , {
          cron_time:time
        }).then((res)=>{

        })
        // CRON JOB START
      } else {
        alert("your time is less than 24");
      }
    });
  }

  addEditSettings(data) {
    this.setCronTime(data.cronjob_time);

    let obj = {
      meta_value: data,
      meta_key: "WEBSITE_SETTINGS"
    };

    let formData = new FormData();
    /*add file to request*/
    formData.append("file", this.state.file);
    formData.append("data", JSON.stringify(data));

    HTTP.Request("post", window.admin.addEditMetaData, obj)
      .then(result => {
        toast(result.message, { type: "success" });

        /*log audits for user*/
        this.props.dispatch({
          type: ADMIN_TRACK_AUDIT_LOGS,
          action: {
            comment: "Updated Website Configuration/Settings",
            type: "audit"
          }
        });
      })
      .catch(err => toast(err.message));
  }

  getSettings() {
    let params = { meta_key: "WEBSITE_SETTINGS" };
    this.setState({ isLoading: true });
    HTTP.Request("get", window.admin.getMetaData, params)
      .then(result => {
        this.setState({ isLoading: false });
        this.props.initialize(result.data.meta_value);
      })
      .catch(err => {
        this.setState({ isLoading: false });
        // toast(err.message,{type:"error"})
      });
  }

  getFile(e) {
    this.setState({ file: e.target.files[0] });
  }
}

let Settings_Form = reduxForm({
  form: "settings_form"
})(Settings);

export default Settings_Form;
