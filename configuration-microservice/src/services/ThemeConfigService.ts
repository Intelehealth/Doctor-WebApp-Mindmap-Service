import { RouteError } from '@src/other/classes';
import HttpStatusCodes from '@src/constants/HttpStatusCodes';
import { ThemeConfig } from '@src/models/theme_config.model'
import { Config } from '@src/models/dic_config.model';
import { Op } from 'sequelize';
import { AuditTrail } from '@src/models/audit_trail.model';
import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize-typescript';
import { getAssetPath } from '@src/util/misc';


// **** Variables **** //

export const CONFIG_NOT_FOUND_ERR = 'Config not Found';
export const FILE_UPLOAD_ERR = 'Unable to upload file';
export const IMAGES_LOCAL_PATH = 'src/public/assets/images';
export const IMAGES_WITH_TEXT = 'images_with_text';

// **** Functions **** //

/**
 * Get all data of theme config.
 */
async function getAll(): Promise<ThemeConfig[]> {
    return await getThemeConfigData();
}

/**
 * Update theme config.
 */
async function updateThemeConfig(key: string, value: string, user_id: string, user_name: string, file?: any): Promise<ThemeConfig|null> {
    const themeConfig = await ThemeConfig.findOne({ where: { key } });
    if (!themeConfig) {
        throw new RouteError(
            HttpStatusCodes.NOT_FOUND,
            CONFIG_NOT_FOUND_ERR,
        );
    }

    let oldFilePath = themeConfig.value;

    if(file){
        value = getAssetPath(file.path);
    }

    // Update theme condig
    await ThemeConfig.update({ value }, { where: { key } });

    // Get all theme config
    const allThemeConfig = await getThemeConfigData();

    // Update dic_config language key
    await Config.update({ value: JSON.stringify(allThemeConfig), published: false }, { where: { key: 'theme_config' } });

    // Delete existing file
    if(oldFilePath) fs.unlinkSync('src/public/'+oldFilePath);

    // Insert audit trail entry
    await AuditTrail.create({ user_id, user_name, activity_type: 'THEME CONFIG UPDATED', description: `Updated "${key}" in theme config.` });

    return await ThemeConfig.findOne({ where: { key } });
}

/**
 * Update images & text.
 */
async function updateImagesText(data : { text: string, image: string}[], user_id: string, user_name: string): Promise<ThemeConfig|null> {
    const key = IMAGES_WITH_TEXT
    const themeConfig = await ThemeConfig.findOne({ where: { key } });
    if (!themeConfig) {
        throw new RouteError(
            HttpStatusCodes.NOT_FOUND,
            CONFIG_NOT_FOUND_ERR,
        );
    }

    if(data.length){
        const imageList = data.map((obj)=>path.basename(obj.image));
        // Update theme condig
        await ThemeConfig.update({ value: JSON.stringify(data) }, { where: { key } });

        // Get all theme config
        const allThemeConfig = await getThemeConfigData();

        // Update dic_config language key
        await Config.update({ value: JSON.stringify(allThemeConfig), published: false }, { where: { key: 'theme_config' } });

        // Delete Old Files
        await removeAllFilesSync(path.join(IMAGES_LOCAL_PATH,'slides'),imageList);

        // Insert audit trail entry
        await AuditTrail.create({ user_id, user_name, activity_type: 'THEME CONFIG UPDATED', description: `Updated Images with Text in theme config.` });

        return await ThemeConfig.findOne({ where: { key } });
    }

    return await ThemeConfig.findOne({ where: { key } });
}

async function getThemeConfigData() {
    let themeConfigData = await ThemeConfig.findAll({
        attributes: ['key', [Sequelize.fn('IFNULL', Sequelize.col('value'), Sequelize.col('default_value')),'value']]
    });
    themeConfigData.forEach(obj=>{
        if(obj.key === IMAGES_WITH_TEXT && obj.value){
            obj.value = JSON.parse(obj.value);
        }
    });
    return themeConfigData;
}


async function removeAllFilesSync(directory:string, excludeFiles:string[]) {
    const files = fs.readdirSync(directory);
    
    for (const file of files) {
        if(excludeFiles.indexOf(file) === -1 && !file.includes('default')){
            const filePath = path.join(directory, file);
            fs.unlinkSync(filePath);
        }
    }
}

// **** Export default **** //

export default {
    getAll,
    updateThemeConfig,
    updateImagesText
} as const;